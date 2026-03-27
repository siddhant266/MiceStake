import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PROXY_ADDRESS, STAKING_ABI } from '../constants';

export function Dashboard() {
  const { address } = useAccount();

  const [amount, setAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now() / 1000);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now() / 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: depositTimeRaw } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'depositTime',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: userInfoRaw } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: pendingRewardsRaw, refetch: refetchRewards } = useReadContract({
    address: PROXY_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getRewards',
    account: address,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

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

  const lockPeriod = 21 * 24 * 60 * 60;
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
    <div className="flex flex-col gap-6 w-full">

      {/* Stake & Unstake Panel */}
      <div className="bg-surface-variant backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 w-full">
        <h2 className="mb-4 text-2xl font-bold font-heading">Stake Tokens</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-text-muted mb-2 block">Amount (ETH)</label>
            <input
              type="text"
              className="bg-background text-text-main font-body text-base w-full rounded-xl px-4 py-3.5 outline-none transition-all duration-200 border border-white/10 focus:border-secondary shadow-inner focus:shadow-[0_0_0_2px_rgba(0,209,255,0.2)]"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              className="w-full font-body font-semibold rounded-full px-6 py-3 inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-none text-white bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleStake}
              disabled={isPending || isTxConfirming || !amount}
            >
              Stake
            </button>
            <button
              className="w-full font-body font-semibold rounded-full px-6 py-3 inline-flex items-center justify-center border border-secondary text-secondary bg-transparent hover:bg-secondary/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
              onClick={handleUnstake}
              disabled={isPending || isTxConfirming || !amount || stakedAmount <= 0}
            >
              Unstake
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-variant backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5">
          <h3 className="text-sm text-text-muted mb-2 font-heading">Total Staked</h3>
          <div className="text-2xl font-bold">{stakedAmount.toFixed(4)} ETH</div>
        </div>
        <div className="bg-surface-variant backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5">
          <h3 className="text-sm text-text-muted mb-2 font-heading">Pending Rewards</h3>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{pendingRewards.toFixed(4)} MICE</div>
        </div>
      </div>

      {/* Claim Section */}
      <div className="bg-surface-variant backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col justify-between items-center gap-4">
        <div className="w-full flex justify-between items-center">
          <div>
            <h2 className="m-0 text-xl font-bold font-heading">Claim Rewards</h2>
            <p className="text-sm text-text-muted mt-2 m-0">{renderCountdown()}</p>
          </div>
          <button
            className="font-body font-semibold rounded-full px-6 py-3 inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border-none text-white bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:-translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLocked || pendingRewards <= 0 || isPending || isTxConfirming}
            onClick={handleClaim}
          >
            {isLocked ? "🔒 Locked" : "Claim MICE"}
          </button>
        </div>
      </div>

      {/* Transaction Status Toast */}
      {txHash && (
        <div className="bg-orange-500/10 backdrop-blur-md rounded-2xl p-4 border border-success mt-4">
          <p className="m-0 text-sm">
            {isTxConfirming ? "Transaction processing..." : "Transaction submitted:"}
            <br /><span className="text-text-muted">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</span>
          </p>
          {isTxSuccess && <p className="m-0 mt-2 font-bold text-success">Transaction Successful! ✓</p>}
        </div>
      )}
    </div>
  );
}
