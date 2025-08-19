#!/bin/sh
stty -echo

# Variaveis globais
VERSION_FILE="/data/local/tmp/app_versions.lock"
ROLLBACK_ENABLED=true

# Funcoes basicas
log() { echo "[$1] $(date '+%H:%M:%S') $2"; }
die() { log "ERR" "$1"; exit 1; }

# Rollback simples
cleanup() {
    [ $? -eq 0 ] && exit 0
    [ "$ROLLBACK_ENABLED" = false ] && exit 0
    
    log "INFO" "Executando rollback..."
    pkill -f fridaserver 2>/dev/null || true
    rm -f shizuku.apk haval.apk "$VERSION_FILE" 2>/dev/null || true
    log "INFO" "Rollback concluido"
    echo 'fff66e9b3d962fa319c8068b5c1997cd'
}
trap cleanup EXIT

# Funcoes de versao
get_latest_version() {
    repo=${1#https://github.com/}; repo=${repo%.git}
    curl -s "https://api.github.com/repos/$repo/releases/latest" | grep '"tag_name"' | cut -d\" -f4
}

get_latest_release() {
    repo=${1#https://github.com/}; repo=${repo%.git}
    curl -s "https://api.github.com/repos/$repo/releases/latest" | grep browser_download_url | cut -d\" -f4
}

save_version() {
    local app="$1" version="$2"
    log "INFO" "Salvando versao: $app=$version"
    
    # Cria o diretorio se nao existir
    mkdir -p "$(dirname "$VERSION_FILE")" 2>/dev/null || true
    
    # Remove entrada existente e adiciona nova
    if [ -f "$VERSION_FILE" ]; then
        grep -v "^$app=" "$VERSION_FILE" > "$VERSION_FILE.tmp" 2>/dev/null || true
        mv "$VERSION_FILE.tmp" "$VERSION_FILE" 2>/dev/null || rm -f "$VERSION_FILE.tmp"
    fi
    
    # Adiciona nova versao
    echo "$app=$version" >> "$VERSION_FILE"
    log "INFO" "Versao salva: $(cat "$VERSION_FILE" 2>/dev/null | grep "^$app=")"
}

get_saved_version() {
    [ -f "$VERSION_FILE" ] && grep "^$1=" "$VERSION_FILE" | cut -d= -f2
}

# Verificacao de versoes
check_versions() {
    shizuku_latest=$(get_latest_version "https://github.com/RikkaApps/Shizuku")
    haval_latest=$(get_latest_version "https://github.com/bobaoapae/haval-app-tool-multimidia")
    shizuku_saved=$(get_saved_version "shizuku")
    haval_saved=$(get_saved_version "haval_app")
    
    if [ "$shizuku_latest" = "$shizuku_saved" ] && [ "$haval_latest" = "$haval_saved" ] && [ -n "$shizuku_saved" ] && [ -n "$haval_saved" ]; then
        echo "🎉 Aplicativos ja atualizados (Shizuku: $shizuku_saved, Haval: $haval_saved)"
        am start -n br.com.redesurftank.havalshisuku/.MainActivity
        echo 'fb5f2f27be2de104ac2b192f3e874dda'
        ROLLBACK_ENABLED=false
        exit 0
    fi
    log "INFO" "Atualizacao necessaria"
}

# Download com verificacao
download() {
    [ -f "$2" ] && [ -s "$2" ] && { log "INFO" "Arquivo $2 ja existe"; return; }
    log "INFO" "Baixando $3..."
    curl -L --progress-bar -o "$2" "$1" || die "Falha no download de $2"
    [ -f "$2" ] && [ -s "$2" ] || die "Arquivo $2 vazio/inexistente"
}

# Instalacao de aplicativo
install_app() {
    local apk="$1" name="$2"
    [ ! -f "$apk" ] && die "$apk nao encontrado"
    
    log "INFO" "Instalando $name..."
    pm install -r "$apk" || die "Falha na instalacao de $name"
}

# Script principal
main() {
    log "INFO" "Iniciando instalacao compacta..."
    cd . || die "Falha ao acessar diretorio"
    
    # Verifica versoes
    check_versions
    
    # Downloads
    log "INFO" "Fase 1: Downloads"
    download "https://logger.assets-redesurftank.com.br/haval/fridaserver.rar" "fridaserver" "fridaserver"
    download "https://logger.assets-redesurftank.com.br/haval/fridainject.rar" "fridainject" "fridainject"
    download "https://logger.assets-redesurftank.com.br/haval/system_server.js" "system_server.js" "system_server.js"
    download "$(get_latest_release "https://github.com/RikkaApps/Shizuku")" "shizuku.apk" "Shizuku APK"
    download "$(get_latest_release "https://github.com/bobaoapae/haval-app-tool-multimidia")" "haval.apk" "Haval APK"
    
    # Permissoes
    log "INFO" "Fase 2: Permissoes"
    chmod +x fridaserver fridainject || die "Falha nas permissoes"
    
    # Fridaserver
    log "INFO" "Fase 3: Servicos"
    if ! pgrep fridaserver >/dev/null; then
        [ -x "./fridaserver" ] || die "fridaserver nao executavel"
        setsid ./fridaserver >/dev/null 2>&1 < /dev/null &
        sleep 2
        pgrep fridaserver >/dev/null || die "fridaserver nao iniciou"
    fi
    
    # Injecao
    [ -f "system_server.js" ] || die "system_server.js nao encontrado"
    SYSTEM_PID=$(pidof system_server) || die "system_server nao encontrado"
    ./fridainject -p "$SYSTEM_PID" -s system_server.js &
    sleep 1
    log "INFO" "Injecao iniciada"
    
    # Instalacoes
    log "INFO" "Fase 4: Aplicativos"
    install_app "shizuku.apk" "Shizuku"
    sleep 10
    install_app "haval.apk" "Haval App"
    
    # Salva versoes
    save_version "shizuku" "$(get_latest_version "https://github.com/RikkaApps/Shizuku")"
    save_version "haval_app" "$(get_latest_version "https://github.com/bobaoapae/haval-app-tool-multimidia")"
    
    # Limpa arquivos temporarios 
    rm -f shizuku.apk haval.apk
    ROLLBACK_ENABLED=false
    
    # Verifica se arquivo foi criado
    if [ -f "$VERSION_FILE" ]; then
        log "INFO" "Arquivo de versoes criado com sucesso em: $VERSION_FILE"
        log "INFO" "Conteudo do arquivo:"
        cat "$VERSION_FILE" | while read line; do log "INFO" "  $line"; done
    else
        log "ERR" "ERRO: Arquivo de versoes nao foi criado em $VERSION_FILE"
    fi

    am start -n br.com.redesurftank.havalshisuku/.MainActivity

    echo 'fb5f2f27be2de104ac2b192f3e874dda'
}

# Executa
main "$@"
