import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { NotebookPen } from 'lucide-react';
import { Button } from "../components/ui/button";

const LandingPage = () => {
    useEffect(() => {
        document.title = "Blog Web App";
    }, [])

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
        onType: (text, i) => {
            if (!skipped) setWelcomeText(text);
        }
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
        onType: (text, i) => {
            if (!skipped) setActionText(text);
        }
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

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-[#1C222A] gap-4'>
            <NotebookPen size={48} color='white' className='mb-4' />
            <div className='text-center'>
                <h1 className='text-3xl font-bold text-white mb-2'>
                    {welcomeText}
                    {showWelcomeCursor && <Cursor cursorStyle='|' />}
                </h1>
                {(startActionTyping || skipped) && (
                    <p className='text-xl text-gray-100 mt-0'>
                        {actionText}
                        {showActionCursor && actionText.length > 0 && <Cursor cursorStyle='|' />}
                    </p>
                )}
            </div>
            {(actionText.length === actionWord.current.length || skipped) && (
                <div className='flex gap-4'>
                    {<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white" asChild>
                            <a href='/login'>Login</a>
                        </Button>
                    </motion.div>}
                    {<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="bg-green-500 hover:bg-green-600 text-white" asChild>
                            <a href='/signup'>Sign Up</a>
                        </Button>
                    </motion.div>}
                </div>
            )}
        </div>
    );
}

export default LandingPage;