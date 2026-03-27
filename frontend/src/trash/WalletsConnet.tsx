import { useConnect, useDisconnect, useAccount } from 'wagmi'

export function WalletsConnect() {
  const { address } = useAccount()
  const { connectors, connect, isPending } = useConnect()

  if (address) {
    return <Disconnect />
  }

  return (
    <div className="flex flex-col md:flex-row p-0 overflow-hidden w-full max-w-[800px] rounded-[20px] bg-[#14171a]/70 border border-white/5 backdrop-blur-lg">
      
      {/* LEFT SECTION */}
      <div className="flex-1 p-10 bg-black/20 border-b md:border-b-0 md:border-r border-white/5">
        <h2 className="text-2xl mb-8 font-heading font-bold">What is a Wallet?</h2>
        
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-[#a6e6ff] to-[#14d1ff]">🏠</div>
          <div>
            <h3 className="text-lg font-bold mb-1">A Home for your Digital Assets</h3>
            <p className="text-text-muted text-sm leading-relaxed m-0">
              Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-start mt-6">
          <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-[#dcb8ff] to-[#8a2be2]">🔑</div>
          <div>
            <h3 className="text-lg font-bold mb-1">A New Way to Log In</h3>
            <p className="text-text-muted text-sm leading-relaxed m-0">
              Instead of creating new accounts and passwords on every website, just connect your wallet.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 items-center">
          <button className="w-full py-3.5 bg-surface-variant text-white rounded-xl font-semibold hover:bg-white/10 transition-colors cursor-pointer border border-transparent">
            Get a Wallet
          </button>
          <a href="#" className="text-secondary text-sm no-underline hover:underline">Learn More</a>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-[1.2] p-10 flex flex-col">
        <h2 className="text-2xl mb-2 font-heading font-bold">Connect Your Wallet</h2>
        <p className="text-text-muted text-[0.95rem] m-0 mb-6">
          Easily link your digital wallet to get started!
        </p>

        <div className="flex flex-col gap-2 mt-2 max-h-[350px] overflow-y-auto pr-1">
          {connectors.length === 0 ? (
            <p className="text-text-muted">No wallets installed.</p>
          ) : (
            connectors.map((connector) => (
              <button 
                key={connector.uid} 
                className="group flex justify-between items-center p-4 bg-white/[0.03] border border-transparent rounded-xl cursor-pointer transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] text-text-main"
                onClick={() => connect({ connector })}
                disabled={isPending}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold">
                    {connector.name.charAt(0)}
                  </div>
                  <span className="text-[1.05rem] font-medium">{connector.name}</span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 bg-transparent transition-all group-hover:border-white/50"></div>
              </button>
            ))
          )}
        </div>

        <p className="mt-6 text-text-muted text-sm leading-relaxed">
          If you don't have a wallet you can select a provider and create one now. <a href="#" className="text-primary no-underline hover:underline">Learn more</a>
        </p>
      </div>

    </div>
  )
}

function Disconnect() {
  const { disconnect } = useDisconnect();

  return (
    <div className="bg-surface-variant backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl max-w-[400px] mx-auto text-center">
      <h2 className="mb-4 text-2xl font-bold font-heading">Wallet Connected</h2>
      <button className="w-full font-body font-semibold rounded-full px-6 py-3 inline-flex items-center justify-center text-secondary border border-secondary transition-colors hover:bg-secondary/10 cursor-pointer" onClick={() => disconnect()}>
        Disconnect wallet
      </button>
    </div>
  )
}