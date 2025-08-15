import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookPen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { NavLink } from 'react-router-dom';
import '@/css/landing-page.css';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 1 } },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};

const iconVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, delay: 0.2 } },
};

const textVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, delay: 0.5 } },
};

const buttonContainerVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, delay: 1.5 } },
};

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

  const [typewriterWelcome, { isDone: isWelcomeDone }] = useTypewriter({
    words: [welcomeWord.current],
    loop: 1,
    typeSpeed: 50,
    delaySpeed: 0,
  });

  const [typewriterAction, { isDone: isActionDone }] = useTypewriter({
    words: [actionWord.current],
    loop: 1,
    typeSpeed: 70,
    delaySpeed: 0,
    skipAdd: !startActionTyping || skipped,
  });

  useEffect(() => {
    if (!skipped) {
      setWelcomeText(typewriterWelcome);
      if (isWelcomeDone) {
        setShowWelcomeCursor(false);
        setTimeout(() => {
          setStartActionTyping(true);
        }, 0);
      }
    }
  }, [typewriterWelcome, isWelcomeDone, skipped]);

  useEffect(() => {
    if (startActionTyping && !skipped) {
      setActionText(typewriterAction);
    }
    if (isActionDone) {
      setShowActionCursor(false);
    }
  }, [typewriterAction, isActionDone, startActionTyping, skipped]);

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
      }, 5000);
    };

    const interval = setInterval(createStar, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="relative flex flex-col items-center justify-center min-h-screen bg-[#1C222A] px-4 sm:px-6 md:px-8 lg:px-12 overflow-hidden"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div id="stars-container" className="absolute inset-0 pointer-events-none"></div>

        <motion.div variants={iconVariants}>
          <NotebookPen size={48} className="mb-4 sm:mb-6 md:mb-8 text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 z-10" />
        </motion.div>

        <div className="text-center max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto z-10">
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4"
            variants={textVariants}
            initial="initial"
            animate="animate"
          >
            {welcomeText}
            {showWelcomeCursor && !skipped && <Cursor cursorStyle="|" />}
          </motion.h1>

          {(startActionTyping || skipped) && (
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-200 mt-1 sm:mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {actionText}
              {showActionCursor && actionText.length > 0 && !skipped && (
                <Cursor cursorStyle="|" />
              )}
            </motion.p>
          )}
        </div>

        {(actionText.length === actionWord.current.length || skipped) && (
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 md:mt-10 w-full sm:w-auto px-4 sm:px-0 z-10"
            variants={buttonContainerVariants}
            initial="initial"
            animate="animate"
          >
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
          </motion.div>
        )}

        {/* This is the moved 'Explore Page' link */}
        {(actionText.length === actionWord.current.length || skipped) && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <p className="text-center">
              If you want to explore the blog without logging in, click{' '}
              <NavLink to='/explore' className="text-blue-400 hover:text-blue-500 transition-colors duration-200">
                Explore Page
              </NavLink>
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LandingPage;