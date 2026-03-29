import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, ArrowRight, Download, Wallet } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connectors, connectAsync, isPending } = useConnect();
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedConnector(null);
    onClose();
  };

  // Remove "Injected"
  const filteredConnectors = connectors.filter(
    (c) => !c.name.toLowerCase().includes('injected')
  );

  // Detect MetaMask
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask;
  };



  // Close modal on connect
  useEffect(() => {
    if (isConnected && isOpen) {
      onClose();
      setSelectedConnector(null);
      navigate('/dashboard');
    }
  }, [isConnected, isOpen, onClose, navigate]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedConnector(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] font-body">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-[72px] right-[calc(50%-200px)] md:right-[15%] w-full max-w-[400px] bg-surface-variant/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Connect Your Wallet</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-muted text-sm mb-5">
              Easily link your digital wallet to get started!
            </p>

            {/* Wallet List */}
            <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto">
              {filteredConnectors.map((connector) => {
                const isMetaMask = connector.name.toLowerCase().includes('metamask');
                const notInstalled = isMetaMask && !isMetaMaskInstalled();


                return (
                  <button
                    key={connector.uid}
                    onClick={async () => {
                      if (notInstalled) {
                        window.open('https://metamask.io/download/', '_blank');
                        return;
                      }

                      try {
                        setSelectedConnector(connector.uid);
                        await connectAsync({ connector });
                      } catch {
                        setSelectedConnector(null);
                      }
                    }}
                    disabled={isPending && !notInstalled}
                    className="group flex justify-between items-center px-4 py-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.08] hover:border-white/10 transition-all text-text-main"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        {connector.icon ? (
                          <img
                            src={connector.icon}
                            alt={connector.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Wallet className="w-5 h-5 text-white/60" />
                        )}
                      </div>

                      <span className="text-[0.95rem] font-semibold">
                        {notInstalled ? 'Install MetaMask' : connector.name}
                      </span>
                    </div>

                    {/* Right */}
                    {notInstalled ? (
                      <Download className="w-4 h-4 text-white/40 group-hover:text-primary" />
                    ) : isPending && selectedConnector === connector.uid ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <p className="mt-5 text-xs text-center text-text-muted">
              If you don't have a wallet, you can create one.{' '}
              <a href="#" className="text-primary hover:underline font-semibold">
                Learn more
              </a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}