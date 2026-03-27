import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { Moon, Sun, Settings, ChevronDown, Copy, LogOut, Wallet, CheckCheck } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { WalletConnectModal } from './WalletConnectModal';

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { theme, setTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const isHome = pathname === '/';
  const isDashboard = pathname === '/dashboard';


  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-wallet-modal', handleOpenModal);
    return () => window.removeEventListener('open-wallet-modal', handleOpenModal);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setDropdownOpen(false);
      }, 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setDropdownOpen(false);
    if (!isHome) navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl py-4">
        <div className="max-w-[1200px] w-full mx-auto flex justify-between items-center px-6">
          {/* LEFT: Logo */}
          <h1
            className="text-2xl font-heading font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary m-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            MiceStake
          </h1>

          {/* RIGHT: Other things */}
          <div className="flex items-center gap-3 md:gap-4 relative">
            {/* Theme Toggle (Always active) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-surface-variant hover:bg-white/10 transition-colors border border-white/5 cursor-pointer hidden md:flex"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-black" />}
            </button>

            {isConnected ? (
              // Connected state (Home and Dashboard)
              <>
                {/* Network */}
                <div className="hidden md:flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-full border border-white/5 shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-500 text-[12px] font-bold">Ξ</span>
                  </div>
                  <span className="text-sm font-medium">Sepolia</span>
                </div>

                {/* Address Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-surface-variant px-4 py-2 rounded-full border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-sm"
                  >
                    {connector?.icon ? (
                      <img src={connector.icon} alt="" className="w-5 h-5 rounded-full object-contain" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-[2px] rotate-45"></div>
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-variant border border-white/10 rounded-xl shadow-xl overflow-hidden z-[60] flex flex-col">
                      <button
                        onClick={handleCopy}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors cursor-pointer text-left border-none bg-transparent ${isCopied ? 'text-green-500' : 'text-text-main'}`}
                      >
                        {isCopied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {isCopied ? "Copied!" : "Copy Address"}
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left border-t border-white/5 bg-transparent"
                      >
                        <LogOut className="w-4 h-4" /> Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* Settings (only on dashboard) */}
                {isDashboard && (
                  <button className="hidden md:flex p-2.5 rounded-full bg-surface-variant border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              // Not connected (e.g. on Home)
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#8a2be2] to-[#a020f0] text-white px-5 py-2.5 rounded-[12px] font-bold shadow-[0_4px_20px_rgba(138,43,226,0.3)] flex items-center gap-2 cursor-pointer border border-white/10 hover:opacity-90 transition-opacity"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal Popup */}
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
