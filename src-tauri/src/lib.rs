use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;
use tokio::sync::Mutex;

pub struct ConnectionState {
    stream: Mutex<Option<TcpStream>>,
}

#[derive(Debug, thiserror::Error)]
enum ApiError {
    #[error("Não conectado ao hotspot do Haval (gateway {0} não inicia com '192.168.33.')")]
    NotHavalHotspot(String),
    #[error("Falha ao obter o gateway da rede")]
    GatewayNotFound,
    #[error("A conexão Telnet não está estabelecida")]
    NotConnected,
    #[error("Já está conectado")]
    AlreadyConnected,
    #[error("Rollback detectado durante a verificação de instalação")]
    RollbackDetected,
    #[error("A resposta esperada não foi recebida a tempo (timeout)")]
    Timeout,
    #[error("Erro de I/O: {0}")]
    Io(#[from] std::io::Error), // Converte erros de IO automaticamente
}

impl serde::Serialize for ApiError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// Equivalente a: api.getGateaway
#[tauri::command]
async fn get_gateway() -> Result<String, ApiError> {
    let gateway = default_net::get_default_gateway().map_err(|_| ApiError::GatewayNotFound)?;

    Ok(gateway.ip_addr.to_string())
}

// Equivalente a: api.isHavalHotspot
#[tauri::command]
async fn is_haval_hotspot() -> Result<(), ApiError> {
    let gateway = get_gateway().await?;
    if !gateway.starts_with("192.168.33.") {
        return Err(ApiError::NotHavalHotspot(gateway));
    }
    Ok(())
}

// Equivalente a: api.isConnected
#[tauri::command]
async fn is_connected(state: tauri::State<'_, ConnectionState>) -> Result<bool, ApiError> {
    let stream_lock = state.stream.lock().await;
    Ok(stream_lock.is_some())
}

// Equivalente a: api.connectToTelnet
#[tauri::command]
async fn connect_to_telnet(state: tauri::State<'_, ConnectionState>) -> Result<(), ApiError> {
    // Bloqueia o acesso ao estado para modificá-lo
    let mut stream_lock = state.stream.lock().await;

    if stream_lock.is_some() {
        println!("Já existe uma conexão ativa.");
        return Err(ApiError::AlreadyConnected);
    }

    let gateway = get_gateway().await?;
    let addr = format!("{}:23", gateway); // Porta 23 é a padrão do Telnet

    println!("Tentando conectar ao Telnet em {}...", addr);
    let stream = TcpStream::connect(&addr).await?;
    println!("Conexão estabelecida com sucesso!");

    // Armazena a nova conexão no estado
    *stream_lock = Some(stream);

    Ok(())
}

// Equivalente a: api.disconnectFromTelnet
#[tauri::command]
async fn disconnect_from_telnet(state: tauri::State<'_, ConnectionState>) -> Result<(), ApiError> {
    let mut stream_lock = state.stream.lock().await;

    // Ao substituir a conexão por `None`, a conexão antiga é "descartada" (dropped).
    // Em Rust, quando um TcpStream é descartado, a conexão é fechada automaticamente.
    if stream_lock.is_some() {
        *stream_lock = None;
        println!("Conexão fechada!");
    }

    Ok(())
}

// Equivalente a: api.sendCommand
#[tauri::command]
async fn send_command(
    command: String,
    state: tauri::State<'_, ConnectionState>,
) -> Result<(), ApiError> {
    let mut stream_lock = state.stream.lock().await;

    // Pega uma referência mutável para a stream dentro do estado
    if let Some(stream) = &mut *stream_lock {
        println!("Enviando comando: {}", command);
        // Adiciona a quebra de linha `\n`, essencial para comandos de terminal
        let command_with_newline = format!("{}\n", command);
        stream.write_all(command_with_newline.as_bytes()).await?;
        stream.flush().await?; // Garante que todos os dados foram enviados
    } else {
        // Se não estiver conectado, retorna um erro.
        // A lógica de reconexão automática pode ser complexa e é melhor
        // ser controlada explicitamente pelo frontend.
        return Err(ApiError::NotConnected);
    }

    Ok(())
}

// Equivalente a: api.injectScript
#[tauri::command]
async fn inject_script(state: tauri::State<'_, ConnectionState>) -> Result<(), ApiError> {
    let install_script = include_str!("install.sh");

    let install_script_escaped = install_script.split('\n').collect::<Vec<_>>().join("\\n");

    let echo_command = format!(
        r#"echo -e '{}' > /data/local/tmp/install.sh"#,
        install_script_escaped
    );

    // Conecta-se caso ainda não esteja conectado
    if !is_connected(state.clone()).await? {
        connect_to_telnet(state.clone()).await?;
    }

    send_command(echo_command, state.clone()).await?;
    tokio::time::sleep(Duration::from_secs(2)).await; // Equivalente a delay(2000)

    send_command(
        "chmod +x /data/local/tmp/install.sh".to_string(),
        state.clone(),
    )
    .await?;
    tokio::time::sleep(Duration::from_secs(1)).await;

    send_command(
        "cd /data/local/tmp && ./install.sh".to_string(),
        state.clone(),
    )
    .await?;
    tokio::time::sleep(Duration::from_secs(1)).await;

    Ok(())
}

// Equivalente a: api.isInstalled
#[tauri::command]
async fn is_installed(state: tauri::State<'_, ConnectionState>) -> Result<(), ApiError> {
    // Esta função vai ouvir por uma resposta específica, com um timeout.
    let operation = async {
        let mut stream_lock = state.stream.lock().await;

        if let Some(stream) = stream_lock.as_mut() {
            // BufReader nos ajuda a ler linhas de forma eficiente.
            let mut reader = BufReader::new(stream);
            let mut line_buffer = Vec::new();

            loop {
                // Limpa o buffer antes de ler uma nova linha
                line_buffer.clear();

                // Lê uma linha da conexão de rede usando read_until para ser mais robusto
                let bytes_read = reader.read_until(b'\n', &mut line_buffer).await?;
                if bytes_read == 0 {
                    // A conexão foi fechada pelo outro lado
                    return Err(ApiError::NotConnected);
                }

                // Tenta decodificar como UTF-8, ignora linhas com caracteres inválidos
                let response = match String::from_utf8_lossy(&line_buffer).trim().to_lowercase() {
                    s if s.is_empty() => {
                        println!("Linha vazia ignorada");
                        continue; // Ignora linhas vazias
                    }
                    s => s.to_string(),
                };
                
                println!("Resposta recebida: '{}'", response);

                if response == "fb5f2f27be2de104ac2b192f3e874dda" {
                    return Ok(());
                } else if response == "fff66e9b3d962fa319c8068b5c1997cd" {
                    return Err(ApiError::RollbackDetected);
                }
                // Se não for nenhuma das respostas esperadas, o loop continua
            }
        } else {
            Err(ApiError::NotConnected)
        }
    };

    match tokio::time::timeout(Duration::from_secs(600), operation).await {
        Ok(result) => result,             // A operação terminou a tempo
        Err(_) => Err(ApiError::Timeout), // A operação demorou demais
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        // 1. Inicializa o nosso estado e o disponibiliza para todos os comandos
        .manage(ConnectionState {
            stream: Mutex::new(None),
        })
        // 2. Registra todos os nossos comandos para que o frontend possa chamá-los
        .invoke_handler(tauri::generate_handler![
            get_gateway,
            is_haval_hotspot,
            connect_to_telnet,
            disconnect_from_telnet,
            send_command,
            is_connected,
            inject_script,
            is_installed
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
