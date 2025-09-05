import apiClient, { getBaseURL } from './apiService.js';

class AuthError extends Error {
  constructor(message, statusCode, data = {}) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

const handleAuthError = (error) => {
  console.error('Auth service error:', error);

  if (!error.response) {
    return new AuthError('Network connection failed. Please check your internet connection.', 0);
  }

  const { status, data } = error.response;
  const message = data?.message || error.message || 'An unexpected error occurred';

  switch (status) {
    case 400:
      return new AuthError(message, 400, data);

    case 401:
      if (message.includes('No account found')) {
        return new AuthError(message, 401, { errorType: 'account_not_found', ...data });
      } else if (message.includes('Incorrect password')) {
        return new AuthError(message, 401, { errorType: 'incorrect_password', ...data });
      } else {
        return new AuthError(message, 401, data);
      }

    case 403:
      if (data?.requiresVerification) {
        return new AuthError(message, 403, {
          ...data,
          requiresVerification: true,
          email: data.email
        });
      }
      return new AuthError(message, 403, data);

    case 409:
      return new AuthError(message, 409, data);

    case 429:
      if (message.includes('Account temporarily locked')) {
        const minutes = message.match(/\d+/)?.[0] || '25';
        return new AuthError(message, 429, {
          ...data,
          isAccountLocked: true,
          lockoutTime: parseInt(minutes)
        });
      }
      return new AuthError(message, 429, data);

    case 404:
      // Not Found
      return new AuthError(message, 404, data);

    case 500:
      // Internal Server Error
      return new AuthError('Server error. Please try again later.', 500, data);

    default:
      return new AuthError(message, status, data);
  }
};

const authService = {
  register: async (firstName, lastName, username, email, password, age) => {
    try {
      if (!firstName?.trim()) throw new AuthError('First name is required', 400);
      if (!lastName?.trim()) throw new AuthError('Last name is required', 400);
      if (!username?.trim()) throw new AuthError('Username is required', 400);
      if (!email?.trim()) throw new AuthError('Email is required', 400);
      if (!password?.trim()) throw new AuthError('Password is required', 400);
      if (!age) throw new AuthError('Age is required', 400);

      const response = await apiClient.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password,
        age: parseInt(age),
      });

      return response.data || response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  verifySignup: async (email, otp) => {
    try {
      if (!email?.trim()) throw new AuthError('Email is required', 400);
      if (!otp?.trim()) throw new AuthError('OTP is required', 400);

      const response = await apiClient.post('/auth/verify-signup', { email, otp });

      // Access data from ApiResponse format
      const userData = response.data || response;

      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      if (userData.user) {
        localStorage.setItem('user', JSON.stringify(userData.user));
      }

      return userData;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  resendOTP: async (email, type) => {
    try {
      if (!email?.trim()) throw new AuthError('Email is required', 400);
      if (!type?.trim()) throw new AuthError('OTP type is required', 400);

      return await apiClient.post('/auth/resend-otp', { email, type });
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  login: async (identifier, password, rememberMe = false) => {
    try {
      if (!identifier || !password) {
        throw new AuthError('Email/Username and password are required', 400);
      }

      const response = await apiClient.post('/auth/login', { identifier, password });

      // Access data from ApiResponse format
      const userData = response.data || response;

      if (userData.token) {
        if (rememberMe) {
          localStorage.setItem('token', userData.token);
        } else {
          sessionStorage.setItem('token', userData.token);
        }
      }
      if (userData.user) {
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData.user));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData.user));
        }
      }

      return userData;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  verifyPassword: async (password) => {
    try {
      if (!password?.trim()) throw new AuthError('Password is required', 400);

      const response = await apiClient.post('/auth/verify-password', { password });
      return response.data ? response.data.success : response.success;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  validateToken: async (token) => {
    try {
      if (!token) throw new AuthError('Token is required', 400);

      const response = await apiClient.get('/auth/validate-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data || response;
      return { valid: true, user: userData.user };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  },

  changePassword: async (currentPassword, newPassword, token) => {
    try {
      if (!currentPassword?.trim()) throw new AuthError('Current password is required', 400);
      if (!newPassword?.trim()) throw new AuthError('New password is required', 400);
      if (!token) throw new AuthError('Authentication token is required', 401);

      const response = await apiClient.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data || response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

const passwordResetService = {
  sendResetOTP: async (email) => {
    try {
      if (!email?.trim()) throw new AuthError('Email is required', 400);

      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data || response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  verifyResetOTP: async (email, otp) => {
    try {
      if (!email?.trim()) throw new AuthError('Email is required', 400);
      if (!otp?.trim()) throw new AuthError('OTP is required', 400);

      const response = await apiClient.post('/auth/verify-reset-otp', { email, otp });
      return response.data || response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      if (!email?.trim()) throw new AuthError('Email is required', 400);
      if (!otp?.trim()) throw new AuthError('OTP is required', 400);
      if (!newPassword?.trim()) throw new AuthError('New password is required', 400);

      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return response.data || response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  setPassword: async (newPassword) => {
    try {
      if (!newPassword?.trim()) throw new AuthError('New password is required', 400);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) throw new AuthError('Authentication token is required', 401);

      const response = await fetch(`${getBaseURL()}/api/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new AuthError(data.message || 'Failed to set password', response.status, data);
      return data;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw handleAuthError(error);
    }
  }
};

export const setPassword = async (newPassword) => {
  try {
    if (!newPassword?.trim()) throw new AuthError('New password is required', 400);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) throw new AuthError('Authentication token is required', 401);

    const response = await fetch(`${getBaseURL()}/api/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new AuthError(data.message || 'Failed to set password', response.status, data);
    return data;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw handleAuthError(error);
  }
};

export default authService;

export { passwordResetService, AuthError, handleAuthError };