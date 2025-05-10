import { createReducer, on } from '@ngrx/store';
import { createUserSuccess } from '../store/master.action';
import { User } from '../../../models/users.model';

// Define the state directly in the reducer
const initialState = {
  users: [] as User[],
  count: 0,
};

const _userReducer = createReducer(
  initialState,
  on(createUserSuccess, (state, action) => ({
    ...state,
    users: [...state.users, action.user],
    count: state.count + 1,
  }))
);




export function userReducer(state: any, action: any) {
  const newState = _userReducer(state, action);
  console.log('Reducer received action:', action); // 👈 log action
  console.log('New state:', newState); // 👈 log new state
  return newState;
}
