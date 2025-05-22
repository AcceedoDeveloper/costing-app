import { createReducer, on } from '@ngrx/store';
import {
  createUserSuccess,
  loadUsersSuccess,
  loadUsersFailure,
  updateUserSuccess,
  updateUserFailure,
  deleteUserSuccess,
  deleteUserFailure,
  loadbaseRoles,
  loadbaseRolesSuccess,
  loadbaseRolesFailure
} from '../store/master.action';
import * as RoleActions from '../store/master.action';  // Adjust path accordingly
import { User } from '../../../models/users.model';
import { Role } from '../../../models/role.model';  // Adjust path accordingly
import { Roles} from '../../../models/MaterialMap.model';

// --- User State ---
export interface UserState {
  rolesb:Roles[];
  roles: Role[];
  users: User[];
  count: number;
  error?: string | null;
}

const initialUserState: UserState = {
  users: [],
  roles: [],
  count: 0,
  rolesb:[]
};

// User Reducer
const _userReducer = createReducer(
  initialUserState,

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
    users: state.users.map((user) =>
      user.UserCode === action.user.UserCode ? action.user : user
    ),
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
  })),

 on(loadbaseRolesSuccess, (state, { roles }) => ({
    ...state,
    rolesb: roles,
    error: null,
  })),
  on(loadbaseRolesFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);

export function userReducer(state: UserState | undefined, action: any) {
  const newState = _userReducer(state, action);
 
  return newState;
}

// --- Role State ---
export interface RoleState {
  roles: Role[];
  error: string | null;
}

const initialRoleState: RoleState = {
  roles: [],
  error: null,
};

// Role Reducer
const _roleReducer = createReducer(
  initialRoleState,

  on(RoleActions.loadRolesSuccess, (state, { roles }) => ({
    ...state,
   roles: roles, 
    error: null,
  })),
  on(RoleActions.loadRolesFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(RoleActions.addRoleSuccess, (state, { role }) => ({
    ...state,
    roles: [...state.roles, role],
    error: null,
  })),
  on(RoleActions.addRoleFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(RoleActions.updateRoleSuccess, (state, { role }) => ({
    ...state,
    roles: state.roles.map((r) => (r._id === role._id ? role : r)),
    error: null,
  })),
  on(RoleActions.updateRoleFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  on(RoleActions.deleteRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter((role) => role._id !== id),
    error: null,
  })),
  on(RoleActions.deleteRoleFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);

export function roleReducer(state: RoleState | undefined, action: any) {
  const newState = _roleReducer(state, action);
  console.log('RoleReducer received action:', action);
  console.log('Role new state:', newState);
  return newState;
}
