import FeaturesSidebar from '../components/FeaturesSidebar';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import authService from '../api/authService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupPageSkeleton } from '../skeleton/pages/SignupPageSkeleton';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
  });

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'Google sign-up failed. Please try again.';

      switch (error) {
        case 'auth_failed':
          errorMessage = 'Google authentication failed. Please try again.';
          break;
        case 'no_user':
          errorMessage = 'Could not retrieve user information from Google.';
          break;
        case 'token_generation_failed':
          errorMessage = 'Failed to create your session. Please try again.';
          break;
        default:
          errorMessage = 'Google sign-up failed. Please try again.';
      }

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (errors.form) {
      const timer = setTimeout(() => {
        setErrors((prevErrors) => ({ ...prevErrors, form: '' }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors.form]);

  useEffect(() => {
    document.title = 'Signup - Blog App';
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(formData.password))
      newErrors.password =
        'Password must be 8+ chars, include 1 capital letter & 1 symbol';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || formData.age <= 0)
      newErrors.age = 'Age must be a positive number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const data = await authService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        parseInt(formData.age)
      );
      loginUser(data, rememberMe);
      navigate('/verify-signup', { state: { email: formData.email } });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.debug('Initiating Google signup...');
    // Clear any previous error from URL
    navigate('/signup', { replace: true });
    const googleAuthUrl = 'http://localhost:5000/api/auth/google';
    console.debug('Redirecting to Google auth URL:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  if (isLoading) {
    return <SignupPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1C222A] flex flex-col xl:flex-row">
      {/* Features Sidebar - Top on mobile/tablet, Left on desktop */}
      <div className="xl:w-1/2 w-full xl:min-h-screen">
        <FeaturesSidebar />
      </div>

      {/* Signup Form - Bottom on mobile/tablet, Right on desktop */}
      <div className="flex flex-col items-center justify-center xl:w-1/2 w-full bg-[#2A2E36] px-4 py-8 xl:py-0">
        <div className="w-full max-w-md xl:max-w-lg">
          <p className="text-white text-2xl xl:text-3xl font-bold mb-6 xl:mb-8 text-center">
            Welcome to Your Blog Space
          </p>
          <h1 className="text-white text-3xl xl:text-4xl font-bold mb-8 xl:mb-10 text-center">
            Sign up Here
          </h1>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                htmlFor="firstName"
              >
                <b>First Name:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <input
                  type="text"
                  id="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your first name"
                  required
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                htmlFor="lastName"
              >
                <b>Last Name:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <input
                  type="text"
                  id="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your last name"
                  required
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </motion.div>
            </div>

            {/* Email */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                htmlFor="email"
              >
                <b>Email:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </motion.div>
            </div>

            {/* Age */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-center space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110"
                htmlFor="age"
              >
                <b>Age:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <input
                  type="number"
                  id="age"
                  min="1"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                  placeholder="Enter your age"
                  required
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}
              </motion.div>
            </div>

            {/* Password */}
            <div className="flex flex-col xl:grid xl:grid-cols-4 xl:gap-4 xl:items-start space-y-2 xl:space-y-0">
              <label
                className="xl:col-span-1 text-white transform transition-transform duration-200 hover:scale-110 xl:pt-3"
                htmlFor="password"
              >
                <b>Password:</b>
              </label>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="xl:col-span-3 w-full"
              >
                <div className="relative w-full">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
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
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </motion.div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex justify-center space-x-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 bg-[#1C222A] border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-white hover:border-2 transition duration-200"
              />
              <label htmlFor="remember" className="text-white">
                <b>Remember Me</b>
              </label>
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm mt-1 mb-2 text-center">
                {errors.form}
              </p>
            )}

            {/* Signup Button */}
            <div className="flex justify-center mt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </Button>
              </motion.div>
            </div>
          </form>

          <div className="flex justify-center mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                onClick={handleGoogleSignup}
              >
                Sign up with Google
              </Button>
            </motion.div>
          </div>

          <p className="text-white mt-6 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
