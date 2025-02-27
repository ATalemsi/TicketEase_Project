import { createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { jwtDecode } from "jwt-decode";

// Base selector
export const selectAuthState = (state: { auth: AuthState }) => state.auth;

// Select the loading state
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

// Select the error state
export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// Select the authentication status
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

// Select the current user's username
export const selectUsername = createSelector(
  selectAuthState,
  (state: AuthState) => state.email
);

// Select the current user's token
export const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

// Select if the user is an admin
export const selectIsAdmin = createSelector(
  selectAuthState,
  (authState: AuthState) => {
    if (!authState.token) return false;
    try {
      const decodedToken: any = jwtDecode(authState.token);
      const userRole: string =
        decodedToken.roles || decodedToken.authorities || '';
      return userRole.includes('ADMIN');
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }
);

// Select user authorities
export const selectAuthorities = createSelector(
  selectAuthState,
  (state: AuthState) => state.role
);
export const selectUserId = createSelector(
  selectAuthState,
  (state: AuthState) => {
    if (!state.token) return null;
    try {
      const decodedToken: any = jwtDecode(state.token);
      return decodedToken.sub || decodedToken.userId || null; // Use 'sub' or 'userId' based on your token structure
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
);
