import { LogOut, Trash2, X, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import HeaderSkeleton from '../skeleton/component/HeaderSkeleton';
import { useAuth } from '../context/AuthContext';
import '@/css/header.css';

export const Header = ({
  title,
  icons = [],
  customElements = [],
  className,
  isLoading = false,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
    }
  };

  return (
    <div
      className={clsx(
        'w-full bg-[#1e1e2f] backdrop-blur-md shadow-md flex items-center justify-between px-4 border-b border-gray-700 overflow-hidden relative transition-all duration-300 h-[70px]', 
        className
      )}
    >
      {/* Main header content */}
      <div className={'flex items-center justify-between w-full transition-all duration-300 opacity-100'}>
        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">
          {title}
        </h1>

        <div className="flex items-center space-x-2">
          {/* Other icons */}
          {icons.map(({ icon: Icon, link, onClick }, index) =>
            Icon === LogOut ? (
              <button
                key={index}
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-500/80 transition-colors duration-200"
              >
                <Icon className="text-white w-5 h-5" />
              </button>
            ) : (
              <button
                key={index}
                onClick={() => handleIconClick(Icon, link, onClick)}
                className={clsx(
                  'p-2 rounded-full transition-colors duration-200',
                  {
                    'hover:bg-red-500/50': Icon === Trash2,
                    'hover:bg-white/10': Icon !== Trash2,
                  }
                )}
              >
                {link ? (
                  <Link to={link}>
                    <Icon className="text-white w-5 h-5" />
                  </Link>
                ) : (
                  <Icon className="text-white w-5 h-5" />
                )}
              </button>
            )
          )}

          {/* Custom elements */}
          {customElements.map((Element, i) => (
            <div key={`custom-${i}`}>{Element}</div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Header;