import { motion } from 'framer-motion';
import React from 'react';

const AnimatedButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset'; disabled?: boolean; }> = ({ children, onClick, className, type, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={className}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;