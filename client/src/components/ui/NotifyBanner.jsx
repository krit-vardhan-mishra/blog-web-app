import { useEffect, useState } from 'react';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const NotifyBanner = ({ message, subMessage, type = 'info', onClose }) => {
  const duration = 3000;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  if (!visible) return null;

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
    <div className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-50">
      <div
        className={`flex items-center ${config.bgColor} border-l-4 ${config.borderColor} ${config.textColor} px-3 py-3 sm:px-4 rounded-lg shadow-lg w-full sm:w-[300px] animate-bounce-in`}
      >
        <IconComponent className={`${config.iconColor} mr-2 sm:mr-3 ${subMessage ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} flex-shrink-0`} />
        {/* Render both message and subMessage */}
        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold truncate sm:whitespace-normal">{message}</p>
          {subMessage && <p className="text-xs text-gray-400 mt-1 truncate sm:whitespace-normal">{subMessage}</p>}
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="ml-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 transition duration-200 cursor-pointer flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotifyBanner;