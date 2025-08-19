import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

export const Warning = () => {
  const [acknowledged, setAcknowledged] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const handleAcknowledge = () => {
    setAcknowledged(true)
    setNetworkError(null)
  }
  
  const handleStart = async () => {
    setIsChecking(true)
    setNetworkError(null)
    
    try {
      // Verifica se está na rede Haval antes de navegar
      await invoke('is_haval_hotspot')
      navigate('/install/terminal')
    } catch (e: any) {  
      setNetworkError(e.toString())
    } finally {
      setIsChecking(false)
    }
  }
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-red-600/20 border border-red-500/30">
              <AlertTriangleIcon className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-red-900/30 border border-red-500/30 text-red-100 px-5 py-4 rounded-xl mb-6">
            <h2 className="font-bold text-center mb-2 text-red-300">
              AVISO IMPORTANTE
            </h2>
            <p className="text-sm">
              Não nos responsabilizamos por quaisquer problemas causados pelo
              software instalado. O uso desta ferramenta é por sua conta e
              risco. Prosseguir com a instalação pode modificar configurações do
              seu dispositivo.
            </p>
          </div>
          {networkError && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-4">
              <p className="text-sm font-medium text-red-300 mb-2">Erro de Rede:</p>
              <p className="text-sm">{networkError}</p>
              <div className="mt-3 text-sm text-red-200">
                <p className="font-medium">Para resolver:</p>
                <p>1️⃣ Ative o hotspot no dispositivo Haval</p>
                <p>2️⃣ Conecte este computador ao WiFi do Haval</p>
                <p>3️⃣ Tente novamente</p>
              </div>
            </div>
          )}
          
          {!acknowledged ? (
            <button
              onClick={handleAcknowledge}
              className="w-full bg-red-600 text-white text-center py-4 px-6 rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-600/30 font-medium"
            >
              Compreendo e Aceito os Riscos
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={isChecking}
              className={`w-full text-center py-4 px-6 rounded-xl transition-all duration-300 font-medium ${
                isChecking 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-600/30'
              }`}
            >
              {isChecking ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Verificando Rede...</span>
                </div>
              ) : (
                'Iniciar Instalação'
              )}
            </button>
          )}
          <Link
            to="/install"
            className="flex items-center justify-center gap-2 w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 border border-gray-600 mt-4"
          >
            <ArrowLeftIcon size={18} />
            <span>Voltar</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
