import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PROXY_ADDRESS, STAKING_ABI } from '../constants';

export function Dashboard() {
  const { address } = useAccount();
  
  const [amount, setAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now() / 1000);

  // Update current time every second for countdowns
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now() / 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  // Read Contracts
  const { data: depositTimeRaw } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'depositTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const { data: userInfoRaw } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const { data: pendingRewardsRaw, refetch: refetchRewards } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getRewards',
    account: address,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Fetch every 5 seconds
    }
  });

  // Write Contracts
  const { writeContract, data: txHash, isPending } = useWriteContract();
  
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleStake = () => {
    if (!amount) return;
    writeContract({
      address: PROXY_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [parseEther(amount)],
      value: parseEther(amount)
    });
  };

  const handleUnstake = () => {
    if (!amount) return;
    writeContract({
      address: PROXY_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [parseEther(amount)]
    });
  };

  const handleClaim = () => {
    writeContract({
      address: PROXY_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'claimRewards'
    });
  };

  const depositTime = depositTimeRaw ? Number(depositTimeRaw) : 0;
  const stakedAmount = userInfoRaw ? Number(formatEther(userInfoRaw[0])) : 0;
  const pendingRewards = pendingRewardsRaw ? Number(formatEther(pendingRewardsRaw)) : 0;
  
  const lockPeriod = 21 * 24 * 60 * 60; // 21 days in seconds
  const unlockTime = depositTime + lockPeriod;
  const isLocked = depositTime > 0 && currentTime < unlockTime;
  
  const renderCountdown = () => {
    if (depositTime === 0) return "Not staked yet";
    if (!isLocked) return "Unlocked";
    const remaining = unlockTime - currentTime;
    const days = Math.floor(remaining / 86400);
    return `Locked: ${days} days remaining`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Stake & Unstake Panel */}
      <div className="glass-card">
        <h2 className="mb-4">Stake Tokens</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-muted mb-2 block">Amount (ETH)</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="0.0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="dashboard-grid">
            <button 
              className="btn btn-primary w-full"
              onClick={handleStake}
              disabled={isPending || isTxConfirming || !amount}
            >
              Stake
            </button>
            <button 
              className="btn btn-outline w-full"
              onClick={handleUnstake}
              disabled={isPending || isTxConfirming || !amount || stakedAmount <= 0}
            >
              Unstake
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Dashboard */}
      <div className="dashboard-grid">
        <div className="glass-card">
          <h3 className="text-sm text-muted mb-2">Total Staked</h3>
          <div className="text-2xl font-bold">{stakedAmount.toFixed(4)} ETH</div>
        </div>
        <div className="glass-card">
          <h3 className="text-sm text-muted mb-2">Pending Rewards</h3>
          <div className="text-2xl font-bold glow-text">{pendingRewards.toFixed(4)} MICE</div>
        </div>
      </div>

      {/* Claim Section */}
      <div className="glass-card flex flex-col justify-between items-center gap-4">
        <div className="w-full flex justify-between items-center">
          <div>
            <h2 className="m-0">Claim Rewards</h2>
            <p className="text-sm text-muted mt-2">{renderCountdown()}</p>
          </div>
          <button 
            className="btn btn-primary"
            disabled={isLocked || pendingRewards <= 0 || isPending || isTxConfirming}
            onClick={handleClaim}
          >
            {isLocked ? "🔒 Locked" : "Claim MICE"}
          </button>
        </div>
      </div>

      {/* Transaction Status Toast */}
      {txHash && (
        <div className="glass-card mt-4" style={{ padding: '16px', border: '1px solid var(--success)', background: 'rgba(255,184,115,0.1)' }}>
          <p className="m-0 text-sm">
            {isTxConfirming ? "Transaction processing..." : "Transaction submitted:"} 
            <br/><span className="text-muted">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</span>
          </p>
          {isTxSuccess && <p className="m-0 mt-2 font-bold" style={{ color: "var(--success)" }}>Transaction Successful! ✓</p>}
        </div>
      )}
    </div>
  );
}
