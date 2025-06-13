import { ActionReducerMap } from '@ngrx/store';
import { AUTH_STATE_NAME } from '../auth/state/auth.selector';
import { SHARED_STATE_NAME } from './Shared/shared.selector';
import { SharedState } from './Shared/shared.state';
import { SharedReducer } from './Shared/shared.reducer';
import { AuthState, authReducer } from '../auth/state/auth.reducer'; // Fix: Use authReducer
import { RouterReducerState, routerReducer } from '@ngrx/router-store';
import { GradeState, gradeReducer} from '../grade/store/grade.reducer';

export interface AppState {
  [SHARED_STATE_NAME]: SharedState;
  [AUTH_STATE_NAME]: AuthState;
  router: RouterReducerState;
  getstate: GradeState;
}

export const appReducer: ActionReducerMap<AppState> = {
  [SHARED_STATE_NAME]: SharedReducer,
  [AUTH_STATE_NAME]: authReducer, // Fix: Use authReducer
  router: routerReducer,
  getstate : gradeReducer
};