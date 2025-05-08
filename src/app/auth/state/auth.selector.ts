import { createSelector } from '@ngrx/store';
import { AppState } from '../../store/app.state'; // Import from app.state.ts

export const AUTH_STATE_NAME = 'auth';

export const selectAuthState = (state: AppState) => state[AUTH_STATE_NAME];
export const isAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);
export const getErrorMessage = createSelector(
  selectAuthState,
  (state) => state.error
);
export const getToken = createSelector(
  selectAuthState,
  (state) => state.token
);