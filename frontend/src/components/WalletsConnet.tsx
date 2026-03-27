import { useConnect, useDisconnect, useAccount } from 'wagmi'

export function WalletsConnect() {
  const { address } = useAccount()

  return <div className='flex flex-col gap-4 items-center'>
      {!address ? <Connectors /> : <Disconnect />}
  </div>
}

function Connectors() {
  const { connectors, connect } = useConnect()
  return connectors.map((connector) => (
    <button className='btn btn-primary w-full' key={connector.uid} onClick={() => connect({ connector })}>
      Connect with {connector.name}
    </button>
  ))
}

function Disconnect() {
  const { disconnect } = useDisconnect();

  return <div>
    <button className='btn btn-outline w-full' onClick={() => disconnect()}>
      Disconnect wallet
    </button>
  </div>
}