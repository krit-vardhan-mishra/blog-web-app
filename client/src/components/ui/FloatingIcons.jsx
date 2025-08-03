import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Filter, Search } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [BookOpen, Sparkles, Filter, Search];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-5">
      {[...Array(8)].map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className="absolute text-blue-400/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              rotate: [0, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          >
            <Icon size={24 + Math.random() * 16} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
