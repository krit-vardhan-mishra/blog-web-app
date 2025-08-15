import { useEffect, useState } from 'react';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

const NotifyBanner = ({ message, subMessage, type = 'info', onClose }) => {
  const duration = 3000;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the banner and call onClose after 'duration' milliseconds
    const timeout = setTimeout(() => {
      setVisible(false);
      // Call onClose after the exit animation completes
      setTimeout(() => onClose?.(), 300); // 300ms matches exit transition duration
    }, duration);

    // Cleanup function to clear the timeout if the component unmounts early
    return () => clearTimeout(timeout);
  }, [duration, onClose]); // Re-run effect if duration or onClose changes

  // Configuration for different banner types (info, success, error, warning)
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

  // Get the appropriate configuration based on the 'type' prop
  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon; // The icon component to render

  // Define animation variants for the banner
  const bannerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 }, // Initial state: invisible, lower, smaller
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.5 } }, // Animate in with spring
    exit: { opacity: 0, y: 50, scale: 0.8, transition: { duration: 0.3 } }, // Animate out: fade, slide down, shrink
  };

  return (
    // AnimatePresence allows components to animate when they are removed from the DOM
    <AnimatePresence>
      {visible && ( // Only render if 'visible' is true
        <motion.div
          className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-50"
          variants={bannerVariants} // Apply defined animation variants
          initial="hidden" // Start from 'hidden' state
          animate="visible" // Animate to 'visible' state
          exit="exit" // Animate to 'exit' state when removed from DOM
        >
          <div
            className={`flex items-center ${config.bgColor} border-l-4 ${config.borderColor} ${config.textColor} px-3 py-3 sm:px-4 rounded-lg shadow-lg w-full sm:w-[300px]`}
          >
            {/* Icon for the notification type */}
            <IconComponent className={`${config.iconColor} mr-2 sm:mr-3 ${subMessage ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} flex-shrink-0`} />
            {/* Main message and optional sub-message */}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold truncate sm:whitespace-normal">{message}</p>
              {subMessage && <p className="text-xs text-gray-400 mt-1 truncate sm:whitespace-normal">{subMessage}</p>}
            </div>
            {/* Close button */}
            <motion.button
              onClick={() => {
                setVisible(false); // Set visible to false to trigger exit animation
              }}
              className="ml-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 transition duration-200 cursor-pointer flex-shrink-0"
              whileHover={{ rotate: 90, scale: 1.1 }} // Rotate and scale on hover
              whileTap={{ scale: 0.9 }} // Shrink on tap
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotifyBanner;
