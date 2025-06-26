import FeaturesSidebar from "../components/FeaturesSidebar";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from '../components/ui/Button';
import { SignupPageSkeleton } from "../skeleton/pages/SignupPageSkeleton";
import FormGroup from "../components/form/FormGroup";

export const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = "Signup - Blog App";
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

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (!passwordRegex.test(formData.password))
      newErrors.password = "Password must be 8+ chars, include 1 capital letter & 1 symbol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      window.location.href = "/home";
    }
  };

  if (isLoading) {
    return <SignupPageSkeleton />;
  }

  return (
    <div className="flex h-screen bg-[#1C222A]">
      <FeaturesSidebar />
      <div className="flex flex-col items-center justify-center w-1/2 bg-[#2A2E36]">
        <p className="text-white text-3xl font-bold mb-8">Welcome to Your Blog Space</p>
        <h1 className="text-white text-4xl font-bold mb-10">Sign up Here</h1>

        <form className="w-3/4 space-y-6" onSubmit={handleSubmit}>
          {/* First Name */}
          <FormGroup
            id="firstName"
            label="First Name:"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
          />

          {/* Last Name */}
          <FormGroup
            id="lastName"
            label="Last Name:"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />

          {/* Email */}
          <FormGroup
            id="email"
            label="Email:"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            type="email"
          />

          {/* Password */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <label htmlFor="password" className="col-span-1 text-white hover:scale-110 transition-transform duration-200">
              <b>Password:</b>
            </label>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="col-span-3 relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pr-10 bg-[#1C222A] text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 hover:border-white hover:border-2 transition duration-200"
                placeholder="Enter your password"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                )}
              </div>
            </motion.div>
            {errors.password && (
              <p className="col-span-4 text-red-500 text-sm mt-1 text-center">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex justify-center space-x-3">
            <input type="checkbox" id="remember" className="h-5 w-5" />
            <label htmlFor="remember" className="text-white"><b>Remember Me</b></label>
          </div>

          {/* Submit */}
          <div className="flex justify-center mt-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg rounded-xl" type="submit">
                Sign up
              </Button>
            </motion.div>
          </div>
        </form>

        <p className="text-white mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};


export default SignupPage;
