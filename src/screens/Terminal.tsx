import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCwIcon, ArrowLeftIcon, PlayIcon, BugIcon } from 'lucide-react'
import { Terminal as TerminalComponent, DebugModal } from '../components'
import { invoke } from '@tauri-apps/api/core'
import { error } from '@tauri-apps/plugin-log';

export const Terminal = () => {
  const [output, setOutput] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [gatewayIp, setGatewayIp] = useState<string>('')
  const [isDebugEnabled, setIsDebugEnabled] = useState(false)
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setOutput([])
    setIsConnected(false)
    setIsConnecting(false)
    setIsExecuting(false)

    const setup = async () => {
      const gateway = await invoke<string>('get_gateway')
      setGatewayIp(gateway)
      setOutput((prev: string[]) => [...prev, `Gateway: ${gateway}`])

      try {
        // Verifica se já está conectado primeiro
        const isAlreadyConnected = await invoke<boolean>('is_connected')
        if (isAlreadyConnected) {
          setIsConnected(true)
          setOutput((prev: string[]) => [...prev, 'Conexão já estabelecida!'])
        } else {
          await invoke('connect_to_telnet')
          setIsConnected(true)
          setOutput((prev: string[]) => [...prev, 'Conexão estabelecida com sucesso!'])
        }
      } catch (e) {
        setIsConnected(false)
        setOutput((prev: string[]) => [...prev, `Erro ao conectar ao telnet: ${e}`])
      }
    }

    setup();
  }, []);

  const executeInstallScript = async () => {
    setIsExecuting(true)
    setIsDebugEnabled(false) // Reset debug state
    
    // Enable debug button after 5 seconds
    setTimeout(() => {
      setIsDebugEnabled(true)
      setOutput((prev: string[]) => [...prev, '🔧 Botão de debug habilitado'])
    }, 2000)
    
    try {
      await invoke('inject_script')
      setOutput((prev: string[]) => [...prev, 'Script injectado com sucessso!'])
      setOutput((prev: string[]) => [...prev, 'Aguarde a instalação...'])
    } catch (e) {
      error(e as string);
      setOutput((prev: string[]) => [...prev, 'Erro ao injetar script!'])
      setIsExecuting(false);
    }

    try {
      await invoke('is_installed')
      navigate('/install/success');
    } catch (e) {
      error(e as string);
      setOutput((prev: string[]) => [...prev, 'Falhou. Clique recomeçar para tentar novamente!'])
      setIsExecuting(false);
    }
  }
  
  const handleRestart = async () => {
    setOutput([])
    setIsConnected(false)
    setIsConnecting(false)
    setIsExecuting(false)
    setGatewayIp('')
    setIsDebugEnabled(false)

    // Attempt to reconnect to telnet
    try {
      setIsConnecting(true)
      setOutput((prev: string[]) => [...prev, 'Desconectando...'])
      
      // Disconnect first
      await invoke('disconnect_from_telnet')
      
      setOutput((prev: string[]) => [...prev, 'Tentando reconectar...'])
      await invoke('connect_to_telnet')
      
      // Verify connection is actually working
      const isConnected = await invoke<boolean>('is_connected')
      if (isConnected) {
        setIsConnected(true)
        setOutput((prev: string[]) => [...prev, 'Reconexão estabelecida com sucesso!'])
      } else {
        setIsConnected(false)
        setOutput((prev: string[]) => [...prev, 'Falha na verificação da conexão!'])
      }
    } catch (e) {
      setIsConnected(false)
      setOutput((prev: string[]) => [...prev, `Erro ao reconectar ao telnet: ${e}`])
    } finally {
      setIsConnecting(false)
    }
  }
  const handleBack = () => {
    handleRestart();
    navigate('/')
  }
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
          <TerminalComponent title={'Instalação em Progresso'} output={output} isConnecting={isConnecting} isExecuting={isExecuting} />
          
          {/* Status de conexão */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Status: {isConnecting ? 'Conectando...' : isConnected ? `Conectado (${gatewayIp})` : 'Desconectado'}</span>
              <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : isConnecting ? 'text-yellow-400' : 'text-red-400'}`}>
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></div>
                {isConnected ? 'Online' : isConnecting ? 'Conectando' : 'Offline'}
              </span>
            </div>
            
            {/* Botão de execução */}
            {isConnected && !isExecuting && (
              <button
                onClick={executeInstallScript}
                className="w-full mb-4 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-5 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-600/30"
              >
                <PlayIcon size={18} />
                <span>Executar Script de Instalação</span>
              </button>
            )}
            
            {isExecuting && (
              <div className="w-full mb-4 flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 px-5 rounded-xl">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Executando Script...</span>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 bg-gray-700 text-white py-3 px-5 rounded-xl hover:bg-gray-600 transition-all duration-300 flex-1 border border-gray-600"
            >
              <ArrowLeftIcon size={18} />
              <span>Voltar</span>
            </button>
            <button
              onClick={handleRestart}
              disabled={isConnecting || isExecuting}
              className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl transition-all duration-300 flex-1 ${!(isConnecting || isExecuting) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              <RefreshCwIcon size={18} />
              <span>Recomeçar</span>
            </button>
          </div>
          
          {/* Botão de Debug */}
          {isExecuting && (
            <button
              onClick={() => setIsDebugModalOpen(true)}
              disabled={!isDebugEnabled}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl transition-all duration-300 ${
                isDebugEnabled 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-600/30' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <BugIcon size={18} />
              <span>
                {isDebugEnabled ? '🔧 Abrir Debug' : '⏳ Debug disponível em 2s'}
              </span>
            </button>
          )}
          
        </div>
      </div>
      
      {/* Modal de Debug */}
      <DebugModal 
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        title="Debug - Instalação"
      />
    </div>
  )
}
