import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Filter, Search } from 'lucide-react';

const FloatingIcons = () => {
  // Array of Lucide React icons to display
  const icons = [BookOpen, Sparkles, Filter, Search];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-5">
      {/* Generate 8 floating icons */}
      {[...Array(8)].map((_, i) => {
        // Randomly select an icon from the array
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className="absolute text-blue-400/10" // Subtle blue tint, low opacity
            style={{
              left: `${Math.random() * 100}%`, // Random horizontal position
              top: `${Math.random() * 100}%`, // Random vertical position
            }}
            animate={{
              y: [0, -50, 0], // Float up and down motion
              x: [0, Math.random() * 30 - 15, 0], // Gentle horizontal sway
              rotate: [0, 360], // Continuous rotation
              opacity: [0.05, 0.15, 0.05], // Subtle fade in/out effect
            }}
            transition={{
              duration: 8 + Math.random() * 4, // Random duration for varied movement
              repeat: Infinity, // Loop animation indefinitely
              delay: Math.random() * 3, // Random start delay for staggered appearance
              ease: "easeInOut" // Smooth easing for natural motion
            }}
          >
            {/* Render the selected icon with a random size */}
            <Icon size={24 + Math.random() * 16} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
