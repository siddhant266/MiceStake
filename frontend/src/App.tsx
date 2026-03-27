import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi'
import { config } from '../config'
import { WalletsConnect } from './components/WalletsConnet'
import { Dashboard } from './components/Dashboard'
import './index.css'

const queryClient = new QueryClient()

function Header() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <header className="header" style={{ marginBottom: "40px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
      <div>
        <h1 className="glow-text m-0" style={{ fontSize: "2rem" }}>MiceStake</h1>
      </div>
      <div>
        {isConnected ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">
              <span style={{ color: "var(--success)" }}>●</span> Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </span>
            <button className="btn btn-outline" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        ) : (
          null
        )}
      </div>
    </header>
  )
}

function MainContent() {
  const { isConnected } = useAccount()
  
  if (!isConnected) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Welcome to MiceStake</h2>
        <p className="text-muted mb-6">Connect your wallet to start staking and earning MICE token rewards.</p>
        <WalletsConnect />
      </div>
    )
  }
  
  return <Dashboard />
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <Header />
          <MainContent />
        </div>
      </QueryClientProvider> 
    </WagmiProvider>
  )
}

export default App;