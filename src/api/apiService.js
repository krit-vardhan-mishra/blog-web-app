const API_BASE_URL = 'http://localhost:5000/api';

const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers, };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        let result;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = await response.text();
        }

        if (!response.ok) {
            if (response.status === 401 && result.expired) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error('Session expired. Please log in again.');
            }

            const errorMessage = typeof result === 'object' && result.message ? result.message : result;
            const error = new Error(errorMessage || `API call failed with status ${response.status}`);
            error.statusCode = response.status;
            error.response = result;
            
            throw error;
        }
        return result;
    } catch (error) {
        console.error("API call error:", error);
        throw error;
    }
};

export default apiCall;