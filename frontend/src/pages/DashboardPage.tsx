import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Settings, Clock, ChevronDown } from 'lucide-react';
import { PROXY_ADDRESS, STAKING_ABI } from '../constants';
import { useTheme } from '../components/ThemeProvider';

export function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [amount, setAmount] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now() / 1000);

  useEffect(() => {
    if (!isConnected) {
      navigate('/connect');
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
    <div className="min-h-screen bg-background font-body text-text-main transition-colors duration-300">
      
      {/* Navbar Dashboard */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl px-4 md:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-heading font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary m-0 cursor-pointer" onClick={() => navigate('/')}>
            MiceStake
          </h1>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-surface-variant hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-black" />}
            </button>

            {/* Network */}
            <div className="hidden md:flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-full border border-white/5 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-500 text-[12px] font-bold">Ξ</span>
              </div>
              <span className="text-sm font-medium">Sepolia</span>
            </div>

            {/* Address */}
            <div className="group relative">
              <button 
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-full border border-white/5 hover:border-red-500/50 transition-all cursor-pointer shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-orange-500 grid place-items-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-[2px] rotate-45"></div>
                </div>
                <span className="text-sm font-medium group-hover:hidden">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </span>
                <span className="text-sm font-medium hidden group-hover:block text-red-500">
                  Disconnect
                </span>
                <ChevronDown className="w-4 h-4 text-text-muted group-hover:hidden" />
              </button>
            </div>
            
            <button className="hidden md:flex p-2.5 rounded-full bg-surface-variant border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-[1000px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stake Interaction */}
          <section className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px]"></div>
              
              <h2 className="text-2xl font-bold font-heading mb-6">Stake ETH</h2>
              
              <div className="bg-background rounded-2xl p-4 border border-white/5 mb-6 relative z-10">
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

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-body font-bold rounded-2xl px-6 py-4 inline-flex items-center justify-center text-white bg-gradient-to-br from-primary to-primary-container shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={handleStake}
                  disabled={isPending || isTxConfirming || !amount}
                >
                  Stake Now
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  className="w-full font-body font-bold rounded-2xl px-6 py-4 inline-flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-text-main"
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
          <aside className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-variant/50 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/5"
            >
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Total Value Locked</h3>
              <div className="text-3xl font-extrabold font-heading mb-6">{stakedAmount.toFixed(4)} <span className="text-sm text-text-muted font-normal">ETH</span></div>
              
              <div className="h-[1px] w-full bg-white/5 my-6"></div>

              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">Pending Rewards</h3>
              <div className="text-3xl font-extrabold font-heading mb-6 glow-text">{pendingRewards.toFixed(4)} <span className="text-sm text-text-muted font-normal">MICE</span></div>

              <div className="bg-background rounded-xl p-4 border border-white/5 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Est. APY</span>
                  <span className="text-secondary font-bold">12.5%</span>
                </div>
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
                  className={`w-full font-body font-bold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-all cursor-${isLocked || pendingRewards <= 0 || isPending || isTxConfirming ? 'not-allowed opacity-50' : 'pointer shadow-[0_4px_20px_rgba(0,209,255,0.3)] hover:-translate-y-1 bg-gradient-to-r from-secondary to-[#14d1ff] text-[#0B0F19]'}`}
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
