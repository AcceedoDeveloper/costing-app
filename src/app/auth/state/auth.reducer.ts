import { createReducer, on } from '@ngrx/store';
import { loginSuccess, loginFail, autoLogout } from './auth.actions';

export interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
};

const _authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    error: null,
  })),
  on(loginFail, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    error,
  })),

  
  on(autoLogout, (state) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
  }))
);

export function authReducer(state: AuthState | undefined, action: any) {
  return _authReducer(state, action);
}