import { HomeIcon, Search, BinocularsIcon, Trash2, SettingsIcon, LogOut, ArrowLeft, UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import Header from './Header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Main App Header - for authenticated users in main app sections
export const MainAppHeader = ({ 
  title, 
  currentPage, 
  customElements = [],
  additionalIcons = []
}) => {
  const { isAuthenticated, logout } = useAuth();
  const { handleSearchToggle } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <PublicHeader title={title} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const baseIcons = [
    { 
      icon: HomeIcon, 
      link: '/home'
    },
    { 
      icon: Search, 
      onClick: handleSearchToggle
    },
    { 
      icon: BinocularsIcon, 
      link: '/explore'
    },
    ...additionalIcons
  ];

  const userDropdown = (
    <DropdownMenu key="user-dropdown">
      <DropdownMenuTrigger asChild>
        <motion.button 
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <UserIcon className="text-white w-5 h-5" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-gray-800/95 border-gray-700 backdrop-blur-md shadow-xl"
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700/80 cursor-pointer transition-colors duration-200"
            onClick={() => navigate('/your-posts')}
          >
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              My Posts
            </motion.span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700/80 cursor-pointer transition-colors duration-200"
            onClick={() => navigate('/account-setting')}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              Settings
            </motion.span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-white hover:bg-gray-700/80 cursor-pointer transition-colors duration-200"
            onClick={() => navigate('/deleted')}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              Deleted Posts
            </motion.span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-400 hover:bg-red-900/50 cursor-pointer transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              Logout
            </motion.span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Header
      title={title}
      icons={baseIcons}
      customElements={[userDropdown, ...customElements]}
    />
  );
};

export const PublicHeader = ({ 
  title, 
  customElements = []
}) => {
  const { handleSearchToggle } = useSearch();
  
  const icons = [
    { 
      icon: Search, 
      onClick: handleSearchToggle
    }
  ];

  return (
    <Header
      title={title}
      icons={icons}
      customElements={customElements}
      showAuthButtons={true}
    />
  );
};

export const DetailHeader = ({ 
  title, 
  titleClassName,
  backLink = -1,
  additionalIcons = [],
  customElements = []
}) => {
  const { isAuthenticated } = useAuth();

  const icons = [
    { 
      icon: ArrowLeft, 
      link: backLink
    },
    ...additionalIcons
  ];

  return (
    <Header
      title={title}
      titleClassName={titleClassName}
      icons={icons}
      customElements={customElements}
      showAuthButtons={!isAuthenticated}
    />
  );
};

export const MyPostsHeader = () => {
  const location = useLocation();
  
  const icons = [
    { 
      icon: HomeIcon, 
      link: '/home'
    },
    { 
      icon: Trash2, 
      link: '/deleted'
    },
    { 
      icon: SettingsIcon, 
      link: '/account-setting'
    },
    { 
      icon: LogOut, 
      link: '/logout'
    },
  ];

  return (
    <Header
      title="Your Posts"
      icons={icons}
    />
  );
};