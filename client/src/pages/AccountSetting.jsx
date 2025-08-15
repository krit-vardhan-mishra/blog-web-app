import { useEffect, useState, useRef, use } from 'react';
import { useNavigate } from 'react-router-dom';

import { HomeIcon, Eye, EyeOff, X, Lock, TrashIcon, User, Mail, Calendar, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import NotifyBanner from '../components/ui/NotifyBanner';
import AccountSettingSkeleton from '../skeleton/pages/AccountSettingSkeleton';
import PasswordConfirmationDialog from '../components/ui/PasswordConfirmationDialog';
import userService from '../api/userService';
import authService from '../api/authService';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import { useAuth } from '@/context/AuthContext';

export const AccountSetting = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletePasswordDialogOpen, setIsDeletePasswordDialogOpen] = useState(false);
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteBlogsChoice, setDeleteBlogsChoice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    about: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.fetchById(user.id);
        setUserDetails(response.user);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (user.id) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    document.title = 'Account Settings';

    const loadUserData = async () => {
      const start = Date.now();

      if (user) {
        const [firstName, ...lastNameParts] = user.name
          ? user.name.split(' ')
          : ['', ''];
        setFormData({
          firstName: firstName || '',
          lastName: lastNameParts.join(' ') || '',
          email: user.email || '',
          age: user.age || '',
          about: user.about || '',
        });
      }

      const elapsed = Date.now() - start;
      const remainingDelay = 450 - elapsed;

      if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      }

      setIsLoading(false);
    };

    loadUserData();
  }, [user]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleDeletePasswordVisibility = () => {
    setShowDeletePassword((prev) => !prev);
  };

  const showNotificationWithType = (message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const validatePassword = async (password) => {
    try {
      const success = await authService.verifyPassword(password);
      return success;
    } catch (error) {
      console.error('Password verification failed:', error);
      if (error.response && error.response.message === 'Incorrect password') {
        setErrorMessage('Incorrect password. Please try again.');
      } else {
        setErrorMessage('Failed to verify password. Please try again later.');
      }
      return false;
    }
  };

  const validateDeletePassword = async (password) => {
    try {
      const response = await authService.verifyPassword(password);
      return response;
    } catch (error) {
      console.error('Password verification failed:', error);
      if (error.message === 'Incorrect password') {
        setDeleteErrorMessage('Incorrect password. Please try again.');
      } else {
        setDeleteErrorMessage(
          'Failed to verify password. Please try again later.'
        );
      }
      return false;
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(false);
    setIsDeletePasswordDialogOpen(true);
  };

  const handleDeleteConfirmation = async (e) => {
    e.preventDefault();
    setDeleteErrorMessage('');

    const isValidPassword = await validateDeletePassword(deletePassword);

    if (isValidPassword) {
      try {
        const response = await userService.deleteAccount(
          user.id,
          deleteBlogsChoice
        );

        if (response.success) {
          showNotificationWithType('Account deleted successfully', 'success');

          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else {
          showNotificationWithType(
            response.message || 'Failed to delete account',
            'error'
          );
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        showNotificationWithType(
          'Error deleting account: ' + (error.message || 'Please try again.'),
          'error'
        );
      } finally {
        setIsDeletePasswordDialogOpen(false);
        setDeletePassword('');
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors = {};
    if (!passwordForm.currentPassword)
      errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword)
      errors.newPassword = 'New password is required';
    if (passwordForm.newPassword.length < 8)
      errors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      const response = await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        token
      );

      if (response && response.success) {
        showNotificationWithType('Password changed successfully!', 'success');
        setTimeout(() => {
          setIsPasswordDialogOpen(false);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          });
          setPasswordErrors({});
        }, 100);
      } else {
        showNotificationWithType(
          response?.message || 'Failed to change password',
          'error'
        );
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showNotificationWithType(
        error || 'Failed to change password',
        'error'
      );
    }
  };

  const handlePasswordConfirm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const isValidPassword = await validatePassword(confirmationPassword);

    if (isValidPassword) {
      setIsDialogOpen(false);
      setConfirmationPassword('');

      const currentFormData = new FormData(formRef.current);
      const dataToUpdate = {
        firstName: currentFormData.get('firstName'),
        email: currentFormData.get('email'),
        age: currentFormData.get('age'),
        about: currentFormData.get('about'),
        ...(formData.lastName && { lastName: formData.lastName }),
      };

      try {
        const response = await userService.updateProfile(dataToUpdate);
        if (response && response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          showNotificationWithType('Profile updated successfully!', 'success');
        } else {
          showNotificationWithType(
            'Failed to update profile: ' +
            (response.message || 'Unknown error'),
            'error'
          );
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        showNotificationWithType(
          'Error updating profile: ' + (error.message || 'Please try again.'),
          'error'
        );
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Enhanced Animation Variants
  const pageVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.95,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: -10,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const profileAvatarVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.2,
        duration: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
      transition: { duration: 0.3 }
    }
  };

  const formInputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    },
    focus: {
      scale: 1.02,
      borderColor: "#3B82F6",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const dangerZoneVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      borderColor: "rgba(239, 68, 68, 0)"
    },
    visible: {
      opacity: 1,
      y: 0,
      borderColor: "rgba(239, 68, 68, 0.5)",
      transition: {
        duration: 0.8,
        ease: "easeOut"
      },
    },
    hover: {
      borderColor: "rgba(239, 68, 68, 1)",
      boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)",
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const infoItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  if (isLoading) {
    return <AccountSettingSkeleton />;
  }

  return (
    <motion.div
      className="min-h-screen bg-[#1A1C20] text-white"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="max-w-6xl mx-auto p-6"
        variants={pageVariants}
      >
        {/* User Profile Summary Card */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
          variants={cardVariants}
          whileHover="hover"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold"
              variants={profileAvatarVariants}
              whileHover="hover"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>

            <div className="flex-1">
              <motion.div
                className="flex items-center space-x-3 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h1 className="text-3xl font-bold">
                  {user?.name || 'Unknown User'}
                </h1>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="w-6 h-6 text-blue-500" />
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <motion.div
                  className="flex items-center space-x-2"
                  variants={infoItemVariants}
                  whileHover="hover"
                >
                  <Mail className="w-4 h-4 text-blue-300" />
                  <span>{user?.email || 'Email not provided'}</span>
                </motion.div>

                <motion.div
                  className="flex items-center space-x-2"
                  variants={infoItemVariants}
                  whileHover="hover"
                >
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Joined: {userDetails?.createdAt ? formatDate(userDetails.createdAt) : 'Unknown'}</span>
                </motion.div>

                {user?.age && (
                  <motion.div
                    className="flex items-center space-x-2"
                    variants={infoItemVariants}
                    whileHover="hover"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Age: {user.age}</span>
                  </motion.div>
                )}

                <motion.div
                  className="flex items-center space-x-2"
                  variants={infoItemVariants}
                  whileHover="hover"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>
                    Status: <motion.span
                      style={{ color: userDetails?.isAccountVerified ? 'green' : 'gray' }}
                      animate={{ opacity: userDetails?.isAccountVerified ? [1, 0.7, 1] : 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {userDetails?.isAccountVerified ? 'Verified' : 'Unverified'}
                    </motion.span>
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Settings Form */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
          whileHover="hover"
        >
          <motion.h2
            className="text-2xl font-bold mb-6 flex items-center space-x-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Settings className="w-6 h-6" />
            <span>Profile Settings</span>
          </motion.h2>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <motion.div variants={formInputVariants}>
                <label className="block text-white font-semibold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <motion.input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  whileFocus="focus"
                  variants={formInputVariants}
                />
              </motion.div>

              {/* Last Name */}
              <motion.div variants={formInputVariants}>
                <label className="block text-white font-semibold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <motion.input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  whileFocus="focus"
                  variants={formInputVariants}
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={formInputVariants}>
                <label className="block text-white font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  whileFocus="focus"
                  variants={formInputVariants}
                />
              </motion.div>

              {/* Age */}
              <motion.div variants={formInputVariants}>
                <label className="block text-white font-semibold mb-2" htmlFor="age">
                  Age
                </label>
                <motion.input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                  whileFocus="focus"
                  variants={formInputVariants}
                />
              </motion.div>
            </div>

            {/* About Section */}
            <motion.div
              className="mt-6"
              variants={formInputVariants}
            >
              <label className="block text-white font-semibold mb-2" htmlFor="about">
                About Yourself
              </label>
              <motion.textarea
                id="about"
                name="about"
                rows={4}
                value={formData.about}
                onChange={handleChange}
                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none transition-colors"
                placeholder="Tell us about yourself..."
                whileFocus="focus"
                variants={formInputVariants}
              />
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-all duration-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Save Changes
                </Button>
              </motion.div>
            </div>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="bg-red-900/20 backdrop-blur-md rounded-lg p-6 border border-red-800/50"
          variants={dangerZoneVariants}
          whileHover="hover"
        >
          <motion.h2
            className="text-2xl font-bold mb-4 flex items-center space-x-2 text-red-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrashIcon className="w-6 h-6" />
            </motion.div>
            <span>Danger Zone</span>
          </motion.h2>
          <motion.p
            className="text-gray-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Once you delete your account, there is no going back. Please be certain.
          </motion.p>
          <div>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-all duration-200"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete Account</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        content="Are you sure you want to delete your account? This action cannot be undone."
      />

      {/* Delete Account Password Confirmation Dialog */}
      <PasswordConfirmationDialog
        isOpen={isDeletePasswordDialogOpen}
        onClose={() => {
          setIsDeletePasswordDialogOpen(false);
          setDeletePassword('');
          setDeleteErrorMessage('');
        }}
        onSubmit={handleDeleteConfirmation}
        password={deletePassword}
        setPassword={setDeletePassword}
        togglePasswordVisibility={toggleDeletePasswordVisibility}
        errorMessage={deleteErrorMessage}
        showPassword={showDeletePassword}
        title="Confirm Account Deletion"
        additionalContent={
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.label
              className="flex items-center text-white"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.input
                type="checkbox"
                checked={deleteBlogsChoice}
                onChange={(e) => setDeleteBlogsChoice(e.target.checked)}
                className="mr-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              Also delete all my blogs
            </motion.label>
            <motion.p
              className="text-gray-400 text-sm mt-1"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {deleteBlogsChoice
                ? 'Your blogs will be permanently deleted'
                : 'Your blogs will remain accessible to others'}
            </motion.p>
          </motion.div>
        }
      />

      {/* Profile Update Password Confirmation Dialog */}
      <PasswordConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setConfirmationPassword('');
          setErrorMessage('');
        }}
        onSubmit={handlePasswordConfirm}
        password={confirmationPassword}
        setPassword={setConfirmationPassword}
        togglePasswordVisibility={togglePasswordVisibility}
        errorMessage={errorMessage}
        showPassword={showPassword}
        title="Confirm Password"
      />

      {/* Change Password Dialog */}
      <AnimatePresence>
        {isPasswordDialogOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h3
                  className="text-white text-xl font-bold flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Lock className="w-5 h-5" />
                  <span>Change Password</span>
                </motion.h3>
                <motion.button
                  onClick={() => setIsPasswordDialogOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <form onSubmit={handlePasswordChange}>
                {/* Current Password */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-white font-semibold mb-2" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordFormChange}
                      className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
                      required
                      whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                    />
                    <motion.button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {passwordErrors.currentPassword && (
                      <motion.p
                        className="text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {passwordErrors.currentPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* New Password */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-white font-semibold mb-2" htmlFor="newPassword">
                    New Password
                  </label>
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                    whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                  />
                  <AnimatePresence>
                    {passwordErrors.newPassword && (
                      <motion.p
                        className="text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {passwordErrors.newPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm New Password */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-white font-semibold mb-2" htmlFor="confirmNewPassword">
                    Confirm New Password
                  </label>
                  <motion.input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                    whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }}
                  />
                  <AnimatePresence>
                    {passwordErrors.confirmNewPassword && (
                      <motion.p
                        className="text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {passwordErrors.confirmNewPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="flex justify-end space-x-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      onClick={() => setIsPasswordDialogOpen(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
                    >
                      Update Password
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <NotifyBanner
              message={notificationMessage}
              type={notificationType}
              onClose={() => setShowNotification(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccountSetting;