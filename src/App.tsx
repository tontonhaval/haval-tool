import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home, Install, Success, Terminal, Warning } from './screens'
import { Header } from './components'

export function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/install" element={<Install />} />
          <Route path="/install/warning" element={<Warning />} />
          <Route
            path="/install/terminal"
            element={<Terminal type="install" />}
          />
          <Route path="/install/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  )
}
