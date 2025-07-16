import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { HomeIcon, Eye, EyeOff, X, Lock, TrashIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import AccountSettingSkeleton from '../skeleton/pages/AccountSettingSkeleton';
import PasswordConfirmationDialog from '../components/ui/PasswordConfirmationDialog';
import useAuth from '../hooks/useAuth';
import userService from '../api/userService';
import authService from '../api/authService';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

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

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
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
        document.title = 'Account Setting';
        const delay = new Promise((resolve) => setTimeout(resolve, 1500));

        const loadUserData = async () => {
            if (user) {
                const [firstName, ...lastNameParts] = user.name ? user.name.split(' ') : ['', ''];
                setFormData({
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || '',
                    email: user.email || '',
                    age: user.age || '',
                    about: user.about || '',
                });
            }
            await delay;
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
            console.error("Password verification failed:", error);
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
            console.error("Password verification failed:", error);
            if (error.message === 'Incorrect password') {
                setDeleteErrorMessage('Incorrect password. Please try again.');
            } else {
                setDeleteErrorMessage('Failed to verify password. Please try again later.');
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
                    token: token
                });

                const response = await userService.deleteAccount(user.id, deleteBlogsChoice, token);

                if (response.success) {
                    showNotificationWithType('Account deleted successfully', 'success');

                    setTimeout(() => {
                        logout();
                        navigate('/login');
                    }, 2000);
                } else {
                    showNotificationWithType(response.message || 'Failed to delete account', 'error');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                showNotificationWithType('Error deleting account: ' + (error.message || 'Please try again.'), 'error');
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
        if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
        if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
        if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
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
                    confirmNewPassword: ''
                });
            } else {
                showNotificationWithType(response.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showNotificationWithType(error.message || 'Failed to change password', 'error');
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
                    showNotificationWithType('Failed to update profile: ' + (response.message || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showNotificationWithType('Error updating profile: ' + (error.message || 'Please try again.'), 'error');
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
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return <AccountSettingSkeleton />;
    }

    return (
        <div className="bg-[#1C222A] min-h-screen">
            <Header
                title="Account Setting"
                className="border-red-500"
                icons={[{ icon: HomeIcon, link: '/home' }]}
            />
            <div className='bg-[#1C222A] min-h-screen flex items-center justify-center'>
                <div className="w-full max-w-4xl space-y-8 p-4">
                    {/* Profile Settings Form */}
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="bg-[#2A2E36] p-6 rounded-lg shadow-lg"
                    >
                        <h2 className="text-white text-xl font-bold mb-6">Profile Settings</h2>

                        {/* First Name */}
                        <div className="grid grid-cols-4 gap-4 items-center mb-4">
                            <label className="col-span-1 text-white font-bold" htmlFor="firstName">
                                First Name:
                            </label>
                            <motion.div className="col-span-3">
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </motion.div>
                        </div>

                        {/* Last Name */}
                        <div className="grid grid-cols-4 gap-4 items-center mb-4">
                            <label className="col-span-1 text-white font-bold" htmlFor="lastName">
                                Last Name:
                            </label>
                            <motion.div className="col-span-3">
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </motion.div>
                        </div>

                        {/* Age */}
                        <div className="grid grid-cols-4 gap-4 items-center mb-4">
                            <label className="col-span-1 text-white font-bold" htmlFor="age">
                                Age:
                            </label>
                            <motion.div className="col-span-3">
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </motion.div>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-4 gap-4 items-center mb-4">
                            <label className="col-span-1 text-white font-bold" htmlFor="email">
                                Email:
                            </label>
                            <motion.div className="col-span-3">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </motion.div>
                        </div>

                        {/* About Yourself */}
                        <div className="grid grid-cols-4 gap-4 items-start mb-6">
                            <label className="col-span-1 text-white font-bold" htmlFor="about">
                                About:
                            </label>
                            <motion.div className="col-span-3">
                                <textarea
                                    id="about"
                                    name="about"
                                    rows={3}
                                    value={formData.about}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </motion.div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="button"
                                    onClick={() => setIsPasswordDialogOpen(true)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Change Password
                                </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                                >
                                    Save Profile Changes
                                </Button>
                            </motion.div>
                        </div>
                    </form>

                    {/* Delete Account Section */}
                    <div className="bg-[#2A2E36] p-6 rounded-lg shadow-lg">
                        <h2 className="text-white text-xl font-bold mb-4">Danger Zone</h2>
                        <p className="text-gray-300 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete Your Account
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

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
                                ? "Your blogs will be permanently deleted"
                                : "Your blogs will remain accessible to others"
                            }
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#2A2E36] p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-xl font-bold">Change Password</h3>
                            <button
                                onClick={() => setIsPasswordDialogOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordChange}>
                            {/* Current Password */}
                            <div className="mb-4">
                                <label className="block text-white mb-2" htmlFor="currentPassword">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordFormChange}
                                        className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="mb-4">
                                <label className="block text-white mb-2" htmlFor="newPassword">
                                    New Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordFormChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div className="mb-6">
                                <label className="block text-white mb-2" htmlFor="confirmNewPassword">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={passwordForm.confirmNewPassword}
                                    onChange={handlePasswordFormChange}
                                    className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                                {passwordErrors.confirmNewPassword && (
                                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    onClick={() => setIsPasswordDialogOpen(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />

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