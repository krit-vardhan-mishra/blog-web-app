import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';
import { HomeIcon, Eye, EyeOff, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import AccountSettingSkeleton from '../skeleton/pages/AccountSettingSkeleton';
import PasswordConfirmationDialog from '../components/ui/PasswordConfirmationDialog';

export const AccountSetting = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmationPassword, setConfirmationPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const formRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const validatePassword = (password) => {
        return password === 'password123';
    };

    const handlePasswordConfirm = (e) => {
        e.preventDefault();
        if (validatePassword(confirmationPassword)) {
            setIsDialogOpen(false);
            setConfirmationPassword('');
            setErrorMessage('');

            const formData = new FormData(formRef.current);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
            };
            console.log('Form submitted:', data);

            setShowNotification(true);
        } else {
            setErrorMessage('Incorrect password. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isDialogOpen) {
            setIsDialogOpen(true);
            return;
        }
        const formData = new FormData(e.target);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
        };
        console.log('Form submitted:', data);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setIsLoading(false);
        }, 1500);
        document.title = 'Account Setting';
        return () => clearTimeout(timer);
    }, []);

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
            <div className='bg-[31C222A] min-h-screen flex items-center justify-center'>
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
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your first name"
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
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your last name"
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
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                                placeholder="Enter your email"
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
                                className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200 resize-none"
                                placeholder="Write something about yourself..."
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
            <PasswordConfirmationDialog isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setConfirmationPassword('');
                    setErrorMessage('');
                }}
                onSubmit={handlePasswordConfirm}
                password={confirmationPassword}
                setPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                errorMessage={errorMessage} />

            <Footer />

            {showNotification && (
                <NotifyBanner
                    message="Entered data has been updated."
                    duration={3000}
                    onClose={() => setShowNotification(false)}
                />
            )}
        </div>
    );
};

export default AccountSetting;