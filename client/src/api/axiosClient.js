import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach the current access token to every outgoing request. Read fresh from
// localStorage each time rather than caching it - AuthProvider already treats
// localStorage as the source of truth, so this stays correct without axiosClient
// (a plain module, not a React component) needing any way to read React state.
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401, try exactly one silent refresh-and-retry before giving up.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Use a bare axios call here, not axiosClient - going through axiosClient
      // would run this request back through these same interceptors, risking an
      // infinite loop if /auth/refresh itself ever returned a 401.
      const refreshResponse = await axios.post(
        `${axiosClient.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = refreshResponse.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // The refresh token itself is invalid/expired - nothing left to try.
      // Clear localStorage so a future page load correctly shows "logged out."
      // Note: this does NOT update AuthProvider's React state in the current
      // tab - that still needs a page reload or an explicit logout() call to
      // catch up, since this module has no way to reach into React state.
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
