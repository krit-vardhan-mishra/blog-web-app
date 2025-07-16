import React from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

const PasswordConfirmationDialog = ({
  isOpen,
  onClose,
  onSubmit,
  password,
  setPassword,
  showPassword,
  togglePasswordVisibility,
  title = "Confirm Password",
  errorMessage,
  additionalContent,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-[#1C222A] p-6 rounded-lg shadow-lg w-full max-w-sm relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-white text-lg font-bold mb-4">{title}</h2>
        <form onSubmit={onSubmit}>
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
              placeholder="Enter your password"
              required
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
              )}
            </div>
          </div>

          { additionalContent }

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Confirm
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PasswordConfirmationDialog;