import { useEffect, useState } from 'react';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const NotifyBanner = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  if (!visible) return null;

  // Configuration for different notification types
  const typeConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-[#2A2E36]',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      textColor: 'text-white',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-[#2A2E36]',
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      textColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-[#2A2E36]',
      borderColor: 'border-red-500',
      iconColor: 'text-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-[#2A2E36]',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-500',
      textColor: 'text-white',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div
        className={`flex items-center ${config.bgColor} border-l-4 ${config.borderColor} ${config.textColor} px-4 py-3 rounded-lg shadow-lg w-[300px] animate-bounce-in`}
      >
        <IconComponent className={`${config.iconColor} mr-3 w-5 h-5`} />
        <p className="flex-grow text-sm">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="ml-2 w-8 h-8 flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 transition duration-200 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotifyBanner;
