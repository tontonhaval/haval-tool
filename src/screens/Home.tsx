import { Link } from 'react-router-dom'
import { DownloadIcon, SettingsIcon } from 'lucide-react'

export const Home = () => {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <SettingsIcon size={36} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-8 text-white">
            Haval H6 Exploit
          </h1>
          <div className="space-y-5">
            <Link
              to="/install"
              className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-600/30"
            >
              <DownloadIcon size={22} />
              <span className="text-lg font-medium">Instalar Aplicações</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
