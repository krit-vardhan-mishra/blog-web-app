import apiCall from './apiService.js'; // Ensure apiCall is imported

export const register = async (firstName, lastName, email, password, age) => {
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password, age: parseInt(age) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const login = async (email, password) => {
  console.log("Login function called with:", { email, password });
  console.log("Email type:", typeof email, "Password type:", typeof password);
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log("Server response:", data);
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// New function to verify user's password
export const verifyPassword = async (password, token) => {
  try {
    const response = await apiCall('/auth/verify-password', 'POST', { password }, token);
    return response.success; // The backend returns { success: true } on success
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error; // Re-throw to be caught by the calling component
  }
};
