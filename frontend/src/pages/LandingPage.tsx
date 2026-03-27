import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ShieldCheck, Coins, ArrowRightLeft, LockOpen } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  const handleStart = () => {
    if (isConnected) {
      navigate('/dashboard');
    } else {
      navigate('/connect');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center max-w-[1200px] mx-auto px-6 font-body">
      
      {/* Navbar Minimal Setup for Landing */}
      <nav className="w-full flex justify-between items-center py-6">
        <h1 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          MiceStake
        </h1>
        <button 
          onClick={handleStart}
          className="bg-white/5 hover:bg-white/10 text-text-main border border-border-custom px-5 py-2.5 rounded-full font-semibold transition-all backdrop-blur-md cursor-pointer"
        >
          {isConnected ? "Dashboard" : "Connect App"}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between w-full mt-20 gap-16">
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block border border-primary/30 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            🚀 Web3 Staking Evolved
          </motion.div>
          <h2 className="font-heading text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            STAKE. EARN. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              GROW.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-[500px] leading-relaxed">
            Put your crypto to work. Stake ETH and earn passive MICE rewards securely using our transparent smart contracts.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={handleStart}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold shadow-[0_4px_20px_rgba(138,43,226,0.3)] hover:-translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
            >
              Start Staking
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            <button className="border border-border-custom bg-surface-variant text-text-main px-8 py-4 rounded-full font-bold hover:bg-white/5 transition-all cursor-pointer backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Mock Staking UI Preview */}
        <motion.div 
          className="flex-1 w-full max-w-[500px]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-surface-variant/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="flex justify-between items-center mb-8">
              <span className="font-heading font-bold text-lg">Stake Ethereum</span>
              <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-md">≈ 12.5% APY</span>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-white/5 mb-4">
              <div className="flex justify-between text-sm text-text-muted mb-2">
                <span>Amount</span>
                <span>Balance: 2.45 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">1.50</span>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                  <div className="w-5 h-5 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                    <span className="text-[#3c3c3d] text-[10px] font-bold">Ξ</span>
                  </div>
                  <span className="font-semibold text-sm">ETH</span>
                </div>
              </div>
            </div>
            <button className="w-full py-4 mt-2 bg-white/5 border border-white/10 rounded-xl font-bold text-text-muted text-center cursor-not-allowed">
              Wallet Disconnected
            </button>
          </div>
          {/* Decorative glows */}
          <div className="absolute -z-10 top-[20%] right-[10%] w-[300px] h-[300px] bg-primary-container/20 rounded-full blur-[100px]"></div>
          <div className="absolute -z-10 bottom-[20%] right-[30%] w-[250px] h-[250px] bg-secondary/20 rounded-full blur-[100px]"></div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="mt-32 w-full mb-20">
        <div className="text-center mb-16">
          <h3 className="font-heading text-4xl font-bold mb-4">What is Staking?</h3>
          <p className="text-text-muted text-lg max-w-[600px] mx-auto">
            Staking lets you earn rewards by locking your crypto to support blockchain networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Grow your crypto", desc: "Earn passive yield simply by holding your assets in the protocol.", icon: Coins },
            { title: "Secure the network", desc: "Your staked assets help validate transactions securely.", icon: ShieldCheck },
            { title: "Withdraw anytime", desc: "Unstaking is available past the initial lockup window.", icon: LockOpen },
            { title: "Transparent rewards", desc: "Real-time accrual with auditable smart contracts.", icon: ArrowRightLeft }
          ].map((feat, i) => (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface-variant/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-surface-variant/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary mb-6 border border-white/5">
                <feat.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-3">{feat.title}</h4>
              <p className="text-text-muted text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}
