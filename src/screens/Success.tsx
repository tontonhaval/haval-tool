import { Link } from 'react-router-dom'
import { ArrowLeftIcon, CheckCircleIcon, ShieldIcon } from 'lucide-react'

export const Success = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon size={48} className="text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            Instalação com sucesso!
          </h1>
          
          <div className="space-y-6 mb-8">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldIcon size={20} className="text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Próximos Passos:</h3>
                  <p className="text-green-300 text-sm leading-relaxed">
                    Agora é só aguardar o <strong>App Haval Install</strong> abrir automaticamente. 
                    Em seguida, basta dar as permissões que ele solicitar para garantir o funcionamento completo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-yellow-400 mt-0.5 flex-shrink-0"></div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Importante:</h3>
                  <p className="text-yellow-300 text-sm leading-relaxed">
                    Você pode fechar o aplicativo agora
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-600/30 font-medium"
            >
              <ArrowLeftIcon size={18} />
              <span>Voltar ao Início</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
