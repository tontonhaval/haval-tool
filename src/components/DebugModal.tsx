import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Terminal } from "./Terminal"

interface DebugModalProps {
  isOpen: boolean
  onClose?: () => void
}

export const DebugModal = ({ isOpen, onClose }: DebugModalProps) => {
  const [output, setOutput] = useState<string[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    setOutput([]);
    let pollInterval: number | null = null
    let lastOutputLength = 0

    if (isOpen) {
      const startMonitoring = async () => {
        try {
          // Inicia o monitoramento do Telnet
          await invoke('start_telnet_monitor')
          setIsMonitoring(true)
          
          // Polling para obter o output
          pollInterval = setInterval(async () => {
            try {
              const newOutput = await invoke<string[]>('get_telnet_output')
              
              // Verifica se há novas linhas
              if (newOutput.length > lastOutputLength) {
                const newLines = newOutput.slice(lastOutputLength)
                setOutput(prev => [...prev, ...newLines])
                lastOutputLength = newOutput.length
              }
            } catch (error) {
              console.error('Erro ao obter output:', error)
            }
          }, 100)
        } catch (error) {
          console.error('Erro ao iniciar monitoramento:', error)
        }
      }

      startMonitoring()
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      // Para o monitoramento quando o modal fecha
      if (!isOpen) {
        invoke('stop_telnet_monitor').catch(() => {})
        setIsMonitoring(false)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl w-full h-full max-w-2xl border border-white/20">
        <Terminal 
          title="Debug" 
          output={output} 
          isConnecting={isMonitoring} 
          isExecuting={isMonitoring} 
          onClose={onClose}
        />
      </div>
    </div>
  )
}

// Hook para facilitar o uso do modal
export const useDebugModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return {
    isOpen,
    openModal,
    closeModal
  }
}