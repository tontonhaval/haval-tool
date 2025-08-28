import { useEffect, useState } from 'react'
import { XIcon, RefreshCwIcon, WifiIcon } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export type DebugModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export const DebugModal = ({ isOpen, onClose, title }: DebugModalProps) => {
  const [output, setOutput] = useState<string[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    // Start monitoring when modal opens
    startMonitoring()

    // Setup event listeners
    const unlistenOutput = listen<string>('telnet-output', (event) => {
      console.log('Telnet output received:', event.payload)
      setOutput(prev => [...prev, event.payload])
      setConnectionStatus('connected')
    })

    const unlistenDisconnected = listen<string>('telnet-disconnected', () => {
      console.log('Telnet disconnected')
      setOutput(prev => [...prev, '--- Conexão encerrada ---'])
      setConnectionStatus('disconnected')
      setIsMonitoring(false)
    })

    const unlistenError = listen<string>('telnet-error', (event) => {
      console.log('Telnet error:', event.payload)
      setOutput(prev => [...prev, `[ERRO] ${event.payload}`])
      setConnectionStatus('error')
    })

    // Cleanup listeners when modal closes
    return () => {
      Promise.all([unlistenOutput, unlistenDisconnected, unlistenError]).then(unlisteners => {
        unlisteners.forEach(unlisten => unlisten())
      })
    }
  }, [isOpen])

  const startMonitoring = async () => {
    try {
      setIsMonitoring(true)
      await invoke('start_telnet_monitor')
      setOutput(prev => [...prev, '📡 Monitoramento iniciado...'])
    } catch (e) {
      console.error('Erro ao iniciar monitoramento:', e)
      setOutput(prev => [...prev, `[ERRO] Falha ao iniciar monitoramento: ${e}`])
      setIsMonitoring(false)
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full mx-4 max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{title || 'Debug - Telnet Monitor'}</h2>
            <div className={`flex items-center gap-2 text-sm`}>
              <WifiIcon size={16} className={
                connectionStatus === 'connected' ? 'text-green-400' : 
                connectionStatus === 'error' ? 'text-red-400' : 
                'text-gray-400'
              } />
              <div className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                connectionStatus === 'error' ? 'bg-red-400' : 
                'bg-gray-400'
              }`} />
              <span className={
                connectionStatus === 'connected' ? 'text-green-400' : 
                connectionStatus === 'error' ? 'text-red-400' : 
                'text-gray-400'
              }>
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'error' ? 'Erro' : 
                 'Desconectado'}
              </span>
            </div>
            {isMonitoring && (
              <span className="text-xs text-yellow-400">
                Monitorando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearOutput}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Limpar output"
            >
              <RefreshCwIcon size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>
        
        {/* Content - Terminal Output */}
        <div className="p-6">
          <div className="bg-gray-950 text-green-400 font-mono text-sm p-4 rounded-xl h-96 overflow-y-auto overflow-x-auto border border-gray-800 shadow-inner">
            {output.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Aguardando output do telnet...
              </div>
            ) : (
              output.map((line, index) => (
                <div 
                  key={index} 
                  className={`mb-1 whitespace-pre-wrap ${
                    line.startsWith('[ERRO]') ? 'text-red-400' : 
                    line.startsWith('---') ? 'text-yellow-400' :
                    line.startsWith('📡') ? 'text-blue-400' :
                    'text-green-400'
                  }`}
                >
                  {line}
                </div>
              ))
            )}
            {isMonitoring && (
              <div className="inline-block h-4 w-2 bg-green-500 animate-pulse ml-1"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}