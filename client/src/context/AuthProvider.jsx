import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  // TODO: decide how the logged-in user + tokens are stored (React state? localStorage?
  // a mix - user/accessToken in state, refreshToken in localStorage?) and hold that state here.

  // TODO: login(email, password) - POST /auth/login, store whatever you decided above.

  // TODO: register(name, email, password, role) - POST /auth/register, store the result.

  // TODO: logout() - clear everything you stored.

  // TODO: refreshAccessToken() - POST /auth/refresh, update the stored access token.
  // Decide where this gets called from (on a 401? on a timer? both?).

  const value = {
    // TODO: expose what LoginPage/RegisterPage/ProtectedRoute actually need,
    // e.g. { user, accessToken, login, register, logout, refreshAccessToken }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
