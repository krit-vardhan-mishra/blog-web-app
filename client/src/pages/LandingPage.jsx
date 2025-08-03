import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NotebookPen } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
  useEffect(() => {
    document.title = 'Blog Web App';
  }, []);

  const [welcomeText, setWelcomeText] = useState('');
  const [actionText, setActionText] = useState('');
  const [showWelcomeCursor, setShowWelcomeCursor] = useState(true);
  const [startActionTyping, setStartActionTyping] = useState(false);
  const [showActionCursor, setShowActionCursor] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const welcomeWord = useRef('Welcome to Blog App.');
  const actionWord = useRef('Login or Sign Up to continue.');

  const typewriterWelcome = useTypewriter({
    words: [welcomeWord.current],
    loop: 1,
    typeSpeed: 50,
    delaySpeed: 0,
    onLoopDone: () => {
      setShowWelcomeCursor(false);
      setTimeout(() => {
        setStartActionTyping(true);
      }, 0);
    },
    skipAdd: skipped ? true : undefined,
    onType: (text) => {
      if (!skipped) setWelcomeText(text);
    },
  });

  const typewriterAction = useTypewriter({
    words: [actionWord.current],
    loop: 1,
    typeSpeed: 70,
    delaySpeed: 0,
    skipAdd: !startActionTyping || skipped,
    onLoopDone: () => {
      setShowActionCursor(false);
    },
    onType: (text) => {
      if (!skipped) setActionText(text);
    },
  });

  const handlePageClick = useCallback(() => {
    if (!skipped) {
      setSkipped(true);
      setShowWelcomeCursor(false);
      setShowActionCursor(false);
      setWelcomeText(welcomeWord.current);
      setActionText(actionWord.current);
      setStartActionTyping(true);
    }
  }, [skipped]);

  useEffect(() => {
    document.addEventListener('click', handlePageClick);
    return () => {
      document.removeEventListener('click', handlePageClick);
    };
  }, [handlePageClick]);

  useEffect(() => {
    if (!skipped) {
      setWelcomeText(typewriterWelcome[0]);
      if (startActionTyping) {
        setActionText(typewriterAction[0]);
      }
    }
  }, [typewriterWelcome[0], typewriterAction[0], skipped, startActionTyping]);

  // Sparkle effect
  useEffect(() => {
    const starsContainer = document.getElementById('stars-container');
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}vw`;
      star.style.top = `${Math.random() * 100}vh`;
      star.style.width = `${Math.random() * 3 + 1}px`;
      star.style.height = star.style.width;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      starsContainer.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 5000); // Remove star after animation
    };

    const interval = setInterval(createStar, 300); // Create a new star every 300ms

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#1C222A] px-4 sm:px-6 md:px-8 lg:px-12 overflow-hidden">
      {/* Stars container */}
      <div id="stars-container" className="absolute inset-0 pointer-events-none"></div>

      <NotebookPen size={48} className="mb-4 sm:mb-6 md:mb-8 text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-10" />
      <div className="text-center max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto z-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
          {welcomeText}
          {showWelcomeCursor && <Cursor cursorStyle="|" />}
        </h1>
        {(startActionTyping || skipped) && (
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mt-1 sm:mt-2">
            {actionText}
            {showActionCursor && actionText.length > 0 && (
              <Cursor cursorStyle="|" />
            )}
          </p>
        )}
      </div>
      {(actionText.length === actionWord.current.length || skipped) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10 w-full sm:w-auto px-4 sm:px-0 z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-32 md:w-36 lg:w-40 py-2 sm:py-2.5 text-sm sm:text-base rounded-md transition-colors duration-200"
              asChild
            >
              <a href="/login">Login</a>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-32 md:w-36 lg:w-40 py-2 sm:py-2.5 text-sm sm:text-base rounded-md transition-colors duration-200"
              asChild
            >
              <a href="/signup">Sign Up</a>
            </Button>
          </motion.div>
        </div>
      )}
      <style jsx>{`
        .star {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
          animation: sparkle 5s ease-in-out infinite;
        }

        @keyframes sparkle {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;