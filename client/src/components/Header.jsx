import { LogOut, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import HeaderSkeleton from '../skeleton/component/HeaderSkeleton';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import '@/css/header.css';

export const Header = ({
  title,
  icons = [],
  customElements = [],
  className,
  titleClassName,
  isLoading = false,
  showAuthButtons = false,
}) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  const handleLogout = () => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleIconClick = (icon, link, onClick) => {
    if (onClick) {
      onClick();
    } else if (icon === LogOut) {
      handleLogout();
    } else if (link) {
      if (link === '/logout') {
        handleLogout();
      } else if (link === -1) {
        navigate(-1);
      } else {
        navigate(link);
      }
    }
  };

  const isActiveTab = (link) => {
    if (!link) return false;
    return location.pathname === link;
  };

  // Get icon label based on route
  const getIconLabel = (link, icon) => {
    const labelMap = {
      '/home': 'Home',
      '/explore': 'Explore',
    };
    
    // For search icon (no link), return 'Search'
    if (!link && icon.name === 'Search') {
      return 'Search';
    }
    
    return labelMap[link] || '';
  };

  // Separate navigation icons from user dropdown
  const navigationIcons = icons.filter(({ icon }) => icon !== LogOut);
  const userElements = customElements;

  return (
    <motion.div
      className={clsx(
        'w-full bg-[#1e1e2f] backdrop-blur-md shadow-md flex items-center justify-between px-6 border-b border-gray-700 overflow-hidden relative transition-all duration-300 h-[65px]',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div 
        className="flex items-center justify-between w-full transition-all duration-300"
        layout
      >
        <motion.h1 
          className={clsx("text-white text-xl sm:text-2xl md:text-3xl font-bold", titleClassName)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {title}
        </motion.h1>

        <div className="flex items-center">
          {/* Navigation Icons Section */}
          <motion.div 
            className="flex items-center space-x-1 px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {navigationIcons.map(({ icon: Icon, link, onClick }, index) => {
              const isActive = isActiveTab(link);
              const label = getIconLabel(link, Icon);
              
              return (
                <motion.div
                  key={index}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.button
                    onClick={() => handleIconClick(Icon, link, onClick)}
                    className={clsx(
                      'flex items-center px-3 py-2 rounded-full transition-all duration-300 relative overflow-hidden',
                      {
                        'bg-white/15 text-white': isActive,
                        'hover:bg-white/10 text-gray-400 hover:text-white': !isActive,
                        'hover:bg-red-500/50': Icon === Trash2,
                      }
                    )}
                    layout
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-5 h-5 mr-0" />
                    </motion.div>
                    
                    <AnimatePresence>
                      {isActive && label && (
                        <motion.span
                          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                          animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                          exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Vertical Separator */}
          <motion.div 
            className="h-8 w-px bg-gray-600 mx-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />

          {/* User Section */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {userElements.map((Element, i) => (
              <motion.div 
                key={`custom-${i}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {Element}
              </motion.div>
            ))}

            {showAuthButtons && !isAuthenticated && (
              <motion.div 
                className="flex gap-3" 
                key="auth-buttons"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="login"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="signup"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors duration-200"
                    onClick={() => navigate('/signup')}
                  >
                    Signup
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Header;