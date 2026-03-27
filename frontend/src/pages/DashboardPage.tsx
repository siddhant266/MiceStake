import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { PROXY_ADDRESS, STAKING_ABI } from '../constants';

export function DashboardPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now() / 1000);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

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

  const { data: pendingRewardsRaw } = useReadContract({
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
    if (depositTime === 0) return "No active lock";
    if (!isLocked) return "Unlocked";
    const remaining = unlockTime - currentTime;
    const days = Math.floor(remaining / 86400);
    return `${days} days remaining`;
  };

  if (!isConnected) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background font-body text-text-main transition-colors duration-300">

      {/* Main Content Dashboard */}
      <main className="max-w-[1024px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column: Stake Interaction */}
          <section className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px]"></div>

              <h2 className="text-2xl font-bold font-heading mb-6">Stake ETH</h2>

              <div className="bg-background rounded-lg p-4 border border-white/5 mb-6 relative z-10">
                <div className="flex justify-between text-sm text-text-muted mb-3">
                  <label>Amount to Stake / Unstake</label>
                  <span>Staked: {stakedAmount.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-4xl font-bold outline-none w-[70%] text-text-main"
                  />
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                      <div className="w-5 h-5 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                        <span className="text-[#3c3c3d] text-[10px] font-bold">Ξ</span>
                      </div>
                      <span className="font-semibold text-sm">ETH</span>
                    </div>
                    <button
                      onClick={() => setAmount(stakedAmount.toString())}
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 relative z-10">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-body font-bold rounded-lg px-6 py-3.5 inline-flex items-center justify-center text-white bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={handleStake}
                  disabled={isPending || isTxConfirming || !amount}
                >
                  Stake Now
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-body font-bold rounded-lg px-6 py-3.5 inline-flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text-main"
                  onClick={handleUnstake}
                  disabled={isPending || isTxConfirming || !amount || stakedAmount <= 0}
                >
                  Unstake
                </motion.button>
              </div>
            </motion.div>

            {/* Toasts */}
            <AnimatePresence>
              {txHash && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-success/10 backdrop-blur-md rounded-2xl p-4 border border-success/30 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-success mb-1">
                      {isTxConfirming ? "🕒 Processing Transaction..." : isTxSuccess ? "✅ Transaction Successful!" : "⏳ Transaction Submitted"}
                    </h4>
                    <p className="text-sm text-text-muted m-0 font-mono">Tx: {txHash.substring(0, 14)}...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Right Column: Stats & Claim */}
          <aside className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-xl p-5 shadow-xl border border-white/5"
            >
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Total Value Locked</h3>
              <div className="text-3xl font-extrabold font-heading">{stakedAmount.toFixed(4)} <span className="text-sm text-text-muted font-normal">ETH</span></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-xl p-5 shadow-xl border border-white/5"
            >
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Pending Rewards</h3>
              <div className="text-3xl font-extrabold font-heading glow-text">{pendingRewards.toFixed(4)} <span className="text-sm text-text-muted font-normal">MICE</span></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-xl p-5 shadow-xl border border-white/5"
            >
              <div className="flex justify-between items-center text-sm mb-6">
                <span className="text-text-muted">Est. APY</span>
                <span className="text-secondary font-bold">12.5%</span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className={`${isLocked ? 'text-text-muted' : 'text-success font-semibold'}`}>
                    {renderCountdown()}
                  </span>
                </div>

                <motion.button
                  whileTap={!isLocked ? { scale: 0.98 } : {}}
                  className={`w-full font-body font-bold rounded-lg px-6 py-3.5 flex items-center justify-center gap-2 transition-all cursor-${isLocked || pendingRewards <= 0 || isPending || isTxConfirming ? 'not-allowed opacity-50' : 'pointer shadow-[0_4px_20px_rgba(0,209,255,0.3)] hover:-translate-y-1 bg-gradient-to-r from-secondary to-[#14d1ff] text-[#0B0F19]'}`}
                  disabled={isLocked || pendingRewards <= 0 || isPending || isTxConfirming}
                  onClick={handleClaim}
                >
                  {isLocked ? (
                    <>
                      <span>🔒 Locked</span>
                    </>
                  ) : (
                    <>
                      <span>Claim Rewards</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </aside>

        </div>
      </main>
    </div>
  );
}
