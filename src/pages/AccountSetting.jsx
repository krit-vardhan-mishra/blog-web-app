import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import { HomeIcon, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import AccountSettingSkeleton from '../skeleton/pages/AccountSettingSkeleton';
import PasswordConfirmationDialog from '../components/ui/PasswordConfirmationDialog';
import useAuth from '../hooks/useAuth';
import userService from '../api/userService';
import authService from '../api/authService';

export const AccountSetting = () => {
    const { user, token, setUser } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmationPassword, setConfirmationPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const formRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

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
                ...(lastName && {lastName}),
            };

            try {
                const response = await userService.dataToUpdate(dataToUpdate, token);
                if (response && response.user) {

                    setUser(response.user);
                    localStorage.setItem('user', JSON.stringify(response.user));

                    setNotificationMessage('Profile updated successfully!');
                    setShowNotification(true);
                } else {
                    setNotificationMessage('Failed to update profile: ' + (response.message || 'Unknown error'));
                    setShowNotification(true);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                setNotificationMessage('Error updating profile: ' + (error.message || 'Please try again.'));
                setShowNotification(true);
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
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="w-full max-w-md space-y-6 p-4"
                >
                    {/* First Name */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <label
                            className="col-span-1 text-white font-bold transform transition-transform duration-200 hover:scale-110"
                            htmlFor="firstName"
                        >
                            First Name:
                        </label>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="col-span-3"
                        >
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your updated first name"
                                required
                            />
                        </motion.div>
                    </div>

                    {/* Last Name */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <label
                            className="col-span-1 text-white font-bold transform transition-transform duration-200 hover:scale-110"
                            htmlFor="lastName"
                        >
                            Last Name:
                        </label>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="col-span-3"
                        >
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your updated last name"
                            />
                        </motion.div>
                    </div>

                    {/* Age */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <label
                            className="col-span-1 text-white font-bold transform transition-transform duration-200 hover:scale-110"
                            htmlFor="age"
                        >
                            Age:
                        </label>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="col-span-3"
                        >
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your updated age"
                                required
                            />
                        </motion.div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <label
                            className="col-span-1 text-white font-bold transform transition-transform duration-200 hover:scale-110"
                            htmlFor="email"
                        >
                            Email:
                        </label>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="col-span-3"
                        >
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your updated email"
                                required
                            />
                        </motion.div>
                    </div>

                    {/* About Yourself */}
                    <div className="grid grid-cols-4 gap-4 items-start">
                        <label
                            className="col-span-1 text-white font-bold transform transition-transform duration-200 hover:scale-110"
                            htmlFor="about"
                        >
                            About Yourself:
                        </label>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="col-span-3"
                        >
                            <textarea
                                id="about"
                                name="about"
                                rows={3}
                                value={formData.about}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200 resize-none"
                                placeholder="Update about yourself..."
                                required
                            />
                        </motion.div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center space-x-4 mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                                Save Changes
                            </Button>
                        </motion.div>
                    </div>
                </form>
            </div>

            {/* Password Confirmation Dialog */}
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
            />

            <Footer />

            {showNotification && (
                <NotifyBanner
                    message={notificationMessage}
                    duration={3000}
                    onClose={() => setShowNotification(false)}
                />
            )}
        </div>
    );
};

export default AccountSetting;