import { createReducer, on } from '@ngrx/store';
import { createUserSuccess} from '../store/master.action';
import { User } from '../../../models/users.model';
import { loadUsersSuccess, loadUsersFailure 
  , updateUser, updateUserFailure, updateUserSuccess
  , deleteUserSuccess, deleteUserFailure
} from '../store/master.action';


const initialState = {
  users: [] as User[],
  count: 0,
};

const _userReducer = createReducer(
  initialState,
 
  on(loadUsersSuccess, (state, action) => ({
    ...state,
    users: action.users,
    count: action.users.length,
    error: null,
  })),
  on(loadUsersFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),

  on(createUserSuccess, (state, action) => ({
    ...state,
    users: [...state.users, action.user],
    count: state.count + 1,
  })),

  on(updateUserSuccess, (state, action) => ({
    ...state,
    users: state.users.map((user) => (user.UserCode === action.user.UserCode ? action.user : user)),
    error: null,
  })),
  on(updateUserFailure, (state, action) => ({
    ...state,
    error: action.error,
  })),
  on(deleteUserSuccess, (state, action) => ({
    ...state,
    users: state.users.filter((user) => user.id !== action.id),
    count: state.count - 1,
    error: null,
  })),
  on(deleteUserFailure, (state, action) => ({
    ...state,
    error: action.error,
  }))
);




export function userReducer(state: any, action: any) {
  const newState = _userReducer(state, action);
  console.log('Reducer received action:', action); // 👈 log action
  console.log('New state:', newState); // 👈 log new state
  return newState;
}
