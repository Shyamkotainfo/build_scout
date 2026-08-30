import axios from 'axios';

// Ensure we don't hardcode the backend URL inside components.
// We use Vite's environment variable mechanism (VITE_BACKEND_URL).
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Convert backend errors into safe frontend error states
    const customError = {
      message: 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
      details: null,
    };

    if (!error.response) {
      customError.message = 'Unable to connect to BuildSmart backend';
      customError.code = 'NETWORK_FAILURE';
      customError.status = 0;
    } else if (error.response.status === 404) {
      customError.message = 'Resource not found.';
      customError.code = 'NOT_FOUND';
    } else if (error.response.status === 422) {
      customError.message = 'Invalid request parameters.';
      customError.code = 'VALIDATION_ERROR';
    } else if (error.response.status === 503) {
      customError.message = 'AI service temporarily unavailable';
      customError.code = 'SERVICE_UNAVAILABLE';
    } else if (error.response.data && error.response.data.error) {
      // Use the safe, structured error message from our backend
      customError.message = error.response.data.error.message;
      customError.code = error.response.data.error.code;
      customError.details = error.response.data.error.details;
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
