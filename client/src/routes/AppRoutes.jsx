import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { HomePage } from '../pages/HomePage';
import MyPosts from '../pages/MyPosts';
import DeletedBlogs from '../pages/DeletedBlogs';
import AccountSetting from '../pages/AccountSetting';
import NotFound from '../pages/NotFound';
import GoogleAuthHandler from '../context/GoogleAuthHandler';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerifyOTPPage from '../pages/VerifyOTPPage';
import SetPasswordPage from '../pages/SetPasswordPage';
import { ToastContainer } from 'react-toastify';
import VerifySignupPage from '../pages/VerifySignupPage';
import UserDetail from '../pages/UserDetail';
import BlogDetail from '../pages/BlogDetail';

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/google-auth" element={<GoogleAuthHandler />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/verify-signup" element={<VerifySignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/set-password" element={<SetPasswordPage />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/user/:userId" element={<UserDetail />} />
          <Route path="/blog/:blogId" element={<BlogDetail />} />
          <Route path="/your-posts" element={<MyPosts />} />
          <Route path="/deleted" element={<DeletedBlogs />} />
          <Route path="/account-setting" element={<AccountSetting />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default AppRoutes;