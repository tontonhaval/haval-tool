import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCwIcon, ArrowLeftIcon, PlayIcon } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { error } from '@tauri-apps/plugin-log';
import { Terminal as TerminalComponent, DebugModal, useDebugModal } from '../components'

export const Terminal = () => {
  const [output, setOutput] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [gatewayIp, setGatewayIp] = useState<string>('')
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useDebugModal()


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
        await invoke('connect_to_telnet')
        setIsConnected(true)
        setOutput((prev: string[]) => [...prev, 'Conexão estabelecida com sucesso!'])
      } catch (e) {
        setIsConnected(false)
        setOutput((prev: string[]) => [...prev, 'Erro ao conectar ao telnet!'])
      }
    }

    setup();

    return () => {
      invoke('disconnect_from_telnet').catch(() => {})
      setIsConnected(false)
      setIsConnecting(false)
      setIsExecuting(false)
      setGatewayIp('')
    }
  }, []);

  const executeInstallScript = async () => {
    setIsExecuting(true)
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
  
  const handleRestart = () => {
    setOutput([])
    setIsConnected(false)
    setIsConnecting(false)
    setIsExecuting(false)
    setGatewayIp('')
    navigate('/install/warning')
  }
  const handleBack = () => {
    navigate('/')
  }
  
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
          <TerminalComponent title="Instalação em Progresso" output={output} isConnecting={isConnecting} isExecuting={isExecuting} />          
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
        </div>
      </div>
      
      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg"
      >
        Abrir Debug
      </button>

      {/* Modal de Debug */}
      <DebugModal 
        isOpen={isOpen}
        onClose={closeModal}
      />
    </div>
  )
}
