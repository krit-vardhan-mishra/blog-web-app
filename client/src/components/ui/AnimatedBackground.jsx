import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Update mouse position, used for subtle parallax effects
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Clean up event listener on component unmount
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient Orb 1: Blue */}
      {/* Animates position and scale based on mouse movement for a subtle parallax */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
          left: '10%', // Initial position
          top: '10%',
        }}
        animate={{
          x: mousePosition.x * 0.02, // Move slightly with mouse X
          y: mousePosition.y * 0.02, // Move slightly with mouse Y
          scale: [1, 1.1, 1], // Continuous scaling animation
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 30 },
          y: { type: "spring", stiffness: 50, damping: 30 },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        initial={{ x: -100, y: -100 }} // Initial position for entrance
      />

      {/* Gradient Orb 2: Purple */}
      {/* Similar parallax and scaling, positioned differently */}
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          right: '10%',
          top: '20%',
        }}
        animate={{
          x: mousePosition.x * -0.015, // Moves in opposite direction
          y: mousePosition.y * -0.015, // Moves in opposite direction
          scale: [1, 1.2, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 40, damping: 25 },
          y: { type: "spring", stiffness: 40, damping: 25 },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Gradient Orb 3: Green */}
      {/* Another orb with unique position and animation */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-6"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
          filter: 'blur(35px)',
          left: '60%',
          bottom: '30%',
        }}
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * 0.01,
          scale: [1, 1.15, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 60, damping: 35 },
          y: { type: "spring", stiffness: 60, damping: 35 },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Floating Particles */}
      {/* 15 small particles with individual random animations for a starry effect */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0], // Vertical floating motion
            x: [0, Math.random() * 20 - 10, 0], // Horizontal drift
            opacity: [0.2, 0.8, 0.2], // Fade in/out
            scale: [1, 1.5, 1], // Pulse in size
          }}
          transition={{
            duration: 3 + Math.random() * 4, // Random duration
            repeat: Infinity,
            delay: Math.random() * 2, // Random start delay
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Grid Pattern */}
      {/* Static grid that subtly shifts with mouse movement */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
        }}
      />

      {/* Animated Lines (SVG) */}
      {/* Two SVG paths that animate their drawing and erasing */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0,50 Q 400,200 800,100 T 1600,150"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M 0,300 Q 600,150 1200,250 T 2400,200"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    </div>
  );
};

export default AnimatedBackground;
