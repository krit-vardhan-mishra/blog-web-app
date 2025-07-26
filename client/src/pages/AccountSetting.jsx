import { useEffect, useState, useRef, use } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { HomeIcon, Eye, EyeOff, X, Lock, TrashIcon, User, Mail, Calendar, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
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
        console.log(err.message);
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
        console.log('Attempting to delete account with:', {
          userId: user.id,
          deleteBlogs: deleteBlogsChoice,
          token: token,
        });

        const response = await userService.deleteAccount(
          user.id,
          deleteBlogsChoice,
          token
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

      if (response.success) {
        showNotificationWithType('Password changed successfully!', 'success');
        setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        showNotificationWithType(
          response.message || 'Failed to change password',
          'error'
        );
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showNotificationWithType(
        error.message || 'Failed to change password',
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return <AccountSettingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1A1C20] text-white">
      <Header
        title="Account Settings"
        icons={[{ icon: HomeIcon, link: '/home' }]}
      />

      <motion.div
        className="max-w-6xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* User Profile Summary Card */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user?.name || 'Unknown User'}
                </h1>
                <Settings className="w-6 h-6 text-blue-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-300" />
                  <span>{user?.email || 'Email not provided'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Joined: {userDetails?.createdAt ? formatDate(userDetails.createdAt) : 'Unknown'}</span>
                </div>

                {user?.age && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Age: {user.age}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>
                    Status: <span style={{ color: userDetails?.isAccountVerified ? 'green' : 'gray' }}>
                      {userDetails?.isAccountVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Settings Form */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Profile Settings</span>
          </h2>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-white font-semibold mb-2" htmlFor="age">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* About Section */}
            <div className="mt-6">
              <label className="block text-white font-semibold mb-2" htmlFor="about">
                About Yourself
              </label>
              <textarea
                id="about"
                name="about"
                rows={4}
                value={formData.about}
                onChange={handleChange}
                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none transition-colors"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-all duration-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Change Password</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-red-400">
            <TrashIcon className="w-6 h-6" />
            <span>Danger Zone</span>
          </h2>
          <p className="text-gray-300 mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-all duration-200"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete Account</span>
            </Button>
          </motion.div>
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
          <div className="mb-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={deleteBlogsChoice}
                onChange={(e) => setDeleteBlogsChoice(e.target.checked)}
                className="mr-2"
              />
              Also delete all my blogs
            </label>
            <p className="text-gray-400 text-sm mt-1">
              {deleteBlogsChoice
                ? 'Your blogs will be permanently deleted'
                : 'Your blogs will remain accessible to others'}
            </p>
          </div>
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
      {isPasswordDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-gray-800/90 backdrop-blur-md p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </h3>
              <button
                onClick={() => setIsPasswordDialogOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              {/* Current Password */}
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-white font-semibold mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2" htmlFor="confirmNewPassword">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordFormChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                {passwordErrors.confirmNewPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {passwordErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showNotification && (
        <NotifyBanner
          message={notificationMessage}
          type={notificationType}
          duration={3000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default AccountSetting;