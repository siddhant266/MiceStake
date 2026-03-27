import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { config } from '../config'

import { LandingPage } from './pages/LandingPage'
import { ConnectWalletPage } from './pages/ConnectWalletPage'
import { DashboardPage } from './pages/DashboardPage'
import { ThemeProvider } from './components/ThemeProvider'

import './index.css'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="micestake-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}> 
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/connect" element={<ConnectWalletPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Router>
        </QueryClientProvider> 
      </WagmiProvider>
    </ThemeProvider>
  )
}

export default App;