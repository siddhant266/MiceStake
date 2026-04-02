import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Layers, Zap, ArrowUpRight, ArrowDownLeft, Gift, Activity } from 'lucide-react';
import { PROXY_ADDRESS, STAKING_ABI, TOKEN_ADDRESS, TOKEN_ABI } from '../constants';

export function DashboardPage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [currentTime, setCurrentTime] = useState(Date.now() / 1000);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (!isConnected) navigate('/');
  }, [isConnected, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now() / 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: depositTimeRaw } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'depositTime',
    args: address ? [address] : undefined, query: { enabled: !!address }
  });

  const { data: userInfoRaw } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'users',
    args: address ? [address] : undefined, query: { enabled: !!address }
  });

  const { data: pendingRewardsRaw, refetch: refetchRewards } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'getRewards',
    account: address, query: { enabled: !!address, refetchInterval: 5000 }
  });

  const { data: tokenBalanceRaw, refetch: refetchBalance } = useReadContract({
    address: TOKEN_ADDRESS, abi: TOKEN_ABI, functionName: 'balanceOf',
    args: address ? [address] : undefined, query: { enabled: !!address }
  });

  const { data: totalStakeRaw, refetch: refetchTotalStake } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'totalStake',
  });

  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({ address });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const { refetch: refetchUserInfo } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'users',
    args: address ? [address] : undefined, query: { enabled: !!address }
  });

  const { refetch: refetchDepositTime } = useReadContract({
    address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'depositTime',
    args: address ? [address] : undefined, query: { enabled: !!address }
  });

  useEffect(() => {
    if (isTxSuccess) {
      refetchRewards(); refetchBalance(); refetchUserInfo();
      refetchDepositTime(); refetchTotalStake(); refetchEthBalance();
      setAmount('');
      setInputError('');
    }
  }, [isTxSuccess]);

  const handleStake = () => {
    if (!amount) return;
    const val = parseFloat(amount);
    if (val <= 0) { setInputError('Enter a valid amount'); return; }
    if (val > walletEth) { setInputError(`Insufficient balance. You have ${walletEth.toFixed(5)} ETH`); return; }
    setInputError('');
    writeContract({ address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'stake', args: [parseEther(amount)], value: parseEther(amount) });
  };

  const handleUnstake = () => {
    if (!amount) return;
    const val = parseFloat(amount);
    if (val <= 0) { setInputError('Enter a valid amount'); return; }
    if (val > stakedAmount) { setInputError(`Cannot unstake more than your stake of ${stakedAmount.toFixed(8)} ETH`); return; }
    setInputError('');
    writeContract({ address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'unstake', args: [parseEther(amount)] });
  };

  const handleClaim = () => {
    writeContract({ address: PROXY_ADDRESS, abi: STAKING_ABI, functionName: 'claimRewards' });
  };

  const depositTime = depositTimeRaw ? Number(depositTimeRaw) : 0;
  const stakedAmount = userInfoRaw ? Number(formatEther(userInfoRaw[0])) : 0;
  const pendingRewards = pendingRewardsRaw ? Number(formatEther(pendingRewardsRaw)) : 0;
  const miceBalance = tokenBalanceRaw ? Number(formatEther(tokenBalanceRaw)) : 0;
  const globalTotalStake = totalStakeRaw ? Number(formatEther(totalStakeRaw)) : 0;
  const walletEth = ethBalance ? Number(formatEther(ethBalance.value)) : 0;

  const lockPeriod = 2 * 60;
  const unlockTime = depositTime + lockPeriod;
  const isLocked = depositTime > 0 && currentTime < unlockTime;

  const renderCountdown = () => {
    if (depositTime === 0) return 'No active lock';
    if (!isLocked) return 'Unlocked';
    const remaining = Math.ceil(unlockTime - currentTime);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}m ${secs}s`;
  };

  const sharePercent = globalTotalStake > 0 ? ((stakedAmount / globalTotalStake) * 100).toFixed(2) : '0.00';

  if (!isConnected) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background font-body text-text-main">
      <main className="max-w-[1100px] mx-auto px-4 py-10 space-y-6">

        {/* ── DEMO NOTICE ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
        >
          <span className="text-text-muted/50 text-xs shrink-0">◎</span>
          <p className="text-[11px] text-text-muted/50 m-0 tracking-wide">
            <span className="font-semibold text-text-muted/60">Demo mode —</span> Rewards accrue 1000× faster than production so you can see staking in action. On mainnet, the same 15% earn rate plays out over a full year.
          </p>
        </motion.div>

        {/* ── TOP STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            { label: 'Staked ETH', value: `${stakedAmount.toFixed(8)}`, unit: 'ETH', icon: <Layers className="w-4 h-4" />, accent: 'text-primary' },
            { label: 'Wallet Balance', value: `${walletEth.toFixed(5)}`, unit: 'ETH', icon: <Activity className="w-4 h-4" />, accent: 'text-text-main' },
            { label: 'Pending Rewards', value: `${pendingRewards.toFixed(8)}`, unit: 'MICE', icon: <Gift className="w-4 h-4" />, accent: 'text-secondary' },
            { label: 'Earn Rate', value: '15', unit: '%', icon: <TrendingUp className="w-4 h-4" />, accent: 'text-success' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-variant/40 border border-white/5 rounded-xl p-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{stat.label}</span>
                <span className="text-text-muted">{stat.icon}</span>
              </div>
              <div className={`text-xl font-extrabold font-heading ${stat.accent} leading-none`}>
                {stat.value} <span className="text-xs font-normal text-text-muted">{stat.unit}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Stake Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-surface-variant/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
          >
            {/* ambient glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Tab switcher */}
            <div className="flex gap-1 bg-black/30 rounded-lg p-1 mb-6 relative z-10 w-fit">
              {['stake', 'unstake'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setAmount(''); setInputError(''); }}
                  className={`relative px-5 py-2 text-sm font-bold rounded-md transition-all capitalize cursor-pointer ${activeTab === tab ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                    }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-white/10 rounded-md"
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="relative z-10 mb-6">
              <div className="bg-black/30 border border-white/10 rounded-xl p-5 focus-within:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-text-muted font-medium">Amount</span>
                  <button
                    onClick={() => setAmount(activeTab === 'stake' ? walletEth.toString() : stakedAmount.toString())}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-0.5 rounded-full cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setInputError(''); }}
                    placeholder="0.00"
                    className="bg-transparent text-4xl font-bold font-heading outline-none flex-1 text-text-main placeholder:text-text-muted/30 min-w-0"
                  />
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-full shrink-0">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-[10px] font-black">Ξ</span>
                    </div>
                    <span className="font-bold text-sm">ETH</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[11px] text-text-muted">
                  <span>Available: {activeTab === 'stake' ? walletEth.toFixed(5) : stakedAmount.toFixed(8)} ETH</span>
                  <span>Your stake: {stakedAmount.toFixed(8)} ETH</span>
                </div>
              </div>
            </div>

            {/* Validation error */}
            <AnimatePresence>
              {inputError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative z-10 mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2"
                >
                  <span className="text-red-400 text-xs">⚠</span>
                  <span className="text-xs text-red-400 font-medium">{inputError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <div className="relative z-10">
              {activeTab === 'stake' ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ translateY: -2 }}
                  className="w-full font-bold text-base rounded-xl px-6 py-4 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-primary via-primary to-primary-container shadow-[0_8px_30px_rgba(138,43,226,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 cursor-pointer transition-all"
                  onClick={handleStake}
                  disabled={isPending || isTxConfirming || !amount}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  {isPending || isTxConfirming ? 'Processing...' : 'Stake ETH'}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ translateY: -2 }}
                  className="w-full font-bold text-base rounded-xl px-6 py-4 flex items-center justify-center gap-2 border border-secondary/40 text-secondary hover:bg-secondary/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  onClick={handleUnstake}
                  disabled={isPending || isTxConfirming || !amount || stakedAmount <= 0}
                >
                  <ArrowDownLeft className="w-5 h-5" />
                  {isPending || isTxConfirming ? 'Processing...' : 'Unstake ETH'}
                </motion.button>
              )}
            </div>

            {/* TX Toast */}
            <AnimatePresence>
              {txHash && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="mt-4 relative z-10 bg-success/10 border border-success/25 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isTxConfirming ? 'bg-yellow-400 animate-pulse' : 'bg-success'}`} />
                  <div>
                    <p className="text-sm font-bold text-success m-0">
                      {isTxConfirming ? 'Confirming on-chain…' : isTxSuccess ? 'Transaction confirmed!' : 'Transaction submitted'}
                    </p>
                    <p className="text-[11px] text-text-muted font-mono m-0 mt-0.5">{txHash.slice(0, 18)}…{txHash.slice(-6)}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* YOUR PORTFOLIO — commented out, preserved for reference
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-variant/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4">Your Portfolio</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-bold">Staked ETH</div>
                  <div className="text-2xl font-extrabold font-heading text-primary">
                    {stakedAmount.toFixed(8)} <span className="text-xs font-normal text-text-muted">ETH</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-bold">Wallet ETH Balance</div>
                  <div className="text-lg font-bold font-mono">
                    {walletEth.toFixed(5)} <span className="text-xs font-normal text-text-muted">ETH</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-text-muted font-bold mb-2">
                  <span>Protocol TVL</span>
                  <span>Your Share</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono">{globalTotalStake.toFixed(6)} ETH</span>
                  <span className="text-xs font-bold text-secondary">{sharePercent}%</span>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(parseFloat(sharePercent), 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                  />
                </div>
              </div>
            </motion.div>
            */}

            {/* REWARDS CARD */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-variant/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl flex-1 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Rewards</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-success/15 text-success rounded-full border border-success/25">15% earn rate</span>
              </div>

              <div className="relative z-10 mb-5">
                <div className="text-2xl font-extrabold font-heading text-secondary">
                  {pendingRewards.toFixed(8)}
                  <span className="text-sm font-normal text-text-muted ml-2">MICE</span>
                </div>
                <div className="text-[11px] text-text-muted mt-1 font-mono">
                  Claimed: {miceBalance.toFixed(8)} MICE
                </div>
              </div>

              {/* Lock status — only shown during active lock countdown */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative z-10 flex items-center gap-2 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 overflow-hidden"
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
                    <div className="flex-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Lock Status</div>
                      <div className="text-xs font-bold text-yellow-400">
                        {renderCountdown()} remaining
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Claim button */}
              <motion.button
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                whileHover={!isLocked ? { translateY: -2 } : {}}
                className={`relative z-10 w-full font-bold rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 transition-all ${isLocked || pendingRewards <= 0 || isPending || isTxConfirming
                    ? 'bg-white/5 border border-white/10 text-text-muted cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-secondary to-[#14d1ff] text-[#0B0F19] shadow-[0_6px_24px_rgba(0,209,255,0.3)] cursor-pointer'
                  }`}
                disabled={isLocked || pendingRewards <= 0 || isPending || isTxConfirming}
                onClick={handleClaim}
              >
                {isLocked ? (
                  <><span>🔒</span><span className="text-sm">Locked</span></>
                ) : (
                  <><Zap className="w-4 h-4" /><span className="text-sm">Claim Rewards</span></>
                )}
              </motion.button>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}