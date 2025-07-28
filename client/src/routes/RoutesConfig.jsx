import {
  Route,
  createRoutesFromElements,
} from 'react-router-dom';

import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../components/MainLayout';

import LandingPage from '../pages/LandingPage';
import ExplorePage from '../pages/ExplorePage';
import UserDetail from '../pages/UserDetail';
import BlogDetail from '../pages/BlogDetail';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import VerifySignupPage from '../pages/VerifySignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import VerifyOTPPage from '../pages/VerifyOTPPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import SetPasswordPage from '../pages/SetPasswordPage';
import HomePage from '../pages/HomePage';
import MyPosts from '../pages/MyPosts';
import DeletedBlogs from '../pages/DeletedBlogs';
import AccountSetting from '../pages/AccountSetting';
import NotFound from '../pages/NotFound';
import GoogleAuthHandler from '../context/GoogleAuthHandler';

import {
  exploreLoader,
  blogDetailLoader,
  userDetailLoader,
  createCachedLoader
} from './loaders';

import {
  homePageLoader,
  myPostsLoader,
} from './protectedLoaders';

const cachedExploreLoader = createCachedLoader(exploreLoader);
const cachedBlogDetailLoader = createCachedLoader(blogDetailLoader);
const cachedUserDetailLoader = createCachedLoader(userDetailLoader);

const routes = createRoutesFromElements(
  <>
    {/* Public Routes */}
    <Route element={<PublicRoute />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="google-auth" element={<GoogleAuthHandler />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="verify-otp" element={<VerifyOTPPage />} />
      <Route path="verify-signup" element={<VerifySignupPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="set-password" element={<SetPasswordPage />} />
    </Route>

    {/* Public Loadable Routes */}
    <Route path="explore" element={<ExplorePage />} loader={cachedExploreLoader} />
    <Route path="user/:userId" element={<UserDetail />} loader={cachedUserDetailLoader} />
    <Route path="blog/:blogId" element={<BlogDetail />} loader={cachedBlogDetailLoader} />

    {/* Private Routes */}
    <Route element={<PrivateRoute />}>
      <Route element={<MainLayout />}>
        <Route path="home" element={<HomePage />} loader={homePageLoader} />
        <Route path="your-posts" element={<MyPosts />} loader={myPostsLoader} />
        <Route path="deleted" element={<DeletedBlogs />} />
        <Route path="account-setting" element={<AccountSetting />} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<NotFound />} />
  </>
);

export default routes;