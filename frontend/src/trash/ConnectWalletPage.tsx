import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnect, useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function ConnectWalletPage() {
  const { isConnected, isConnecting } = useAccount();
  const { connectors, connect, error } = useConnect();
  const navigate = useNavigate();
  const [activeConnector, setActiveConnector] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, navigate]);

  const handleConnect = (connector: any) => {
    setActiveConnector(connector.uid);
    connect({ connector });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background relative overflow-hidden font-body">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-surface-variant/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -10 }} 
            animate={{ y: 0 }} 
            className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(138,43,226,0.5)]"
          >
            <span className="text-white text-3xl">🔌</span>
          </motion.div>
          <h2 className="text-3xl font-heading font-extrabold mb-3">Connect Wallet</h2>
          <p className="text-text-muted text-[0.95rem]">
            Choose a wallet to start staking and earning rewards.
          </p>
        </div>

        <div className="flex flex-col gap-4 relative">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-surface/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-20 border border-success"
              >
                <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                <h3 className="text-xl font-bold text-success font-heading">Wallet Connected ✅</h3>
                <p className="text-text-muted mt-2">Redirecting to dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {connectors.length === 0 ? (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center text-text-muted">
              No wallets found. Please install MetaMask.
            </div>
          ) : (
            connectors.map((connector) => {
              const isActive = activeConnector === connector.uid;
              const isLoading = isConnecting && isActive;

              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  disabled={isConnecting}
                  className="group relative overflow-hidden flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-primary/50 rounded-2xl cursor-pointer transition-all"
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center font-bold text-white shadow-lg">
                      {connector.name.charAt(0)}
                    </div>
                    <span className="text-lg font-semibold text-text-main group-hover:text-primary transition-colors">
                      {connector.name}
                    </span>
                  </div>

                  <div className="relative z-10">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-primary transition-colors"></div>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
          >
            <p className="text-sm text-red-400">Connection failed. Please try again.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
