import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

const NotifyBanner = ({ message, duration = 3000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timeout);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div className="flex items-center bg-[#2A2E36] border-l-4 border-blue-500 text-white px-4 py-3 rounded-lg shadow-lg w-[300px] animate-bounce-in">
                <Info className="text-blue-500 mr-3 w-5 h-5" />
                <p className="flex-grow text-sm">{message}</p>
                <button
                    onClick={() => {
                        setVisible(false);
                        onClose?.();
                    }}
                    className="ml-2 w-8 h-8 flex items-center justify-center p-1 rounded-full hover:bg-red-500/10 transition duration-200 cursor-pointer">
                    ✕
                </button>
            </div>
        </div>
    );
};

export default NotifyBanner;