import { Link } from 'react-router-dom'
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react'

export const Install = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="flex justify-center mb-6">
            <DownloadIcon size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            Instalação de Aplicações
          </h1>
          <p className="text-gray-300 mb-8 text-center">
            Clique no botão abaixo para continuar com a instalação de novas
            aplicações no dispositivo.
          </p>
          <div className="space-y-4">
            <Link
              to="/install/warning"
              className="block w-full bg-blue-600 text-white text-center py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-600/30 font-medium"
            >
              Continuar com a Instalação
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300 border border-gray-600"
            >
              <ArrowLeftIcon size={18} />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
