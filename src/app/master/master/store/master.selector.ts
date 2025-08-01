import { createFeatureSelector, createSelector } from '@ngrx/store';

export const ROLE_STATE_NAME = 'roles';
const getRoleState = createFeatureSelector<any>(ROLE_STATE_NAME);

export const USER_STATE_NAME = 'users';
const getUserState = createFeatureSelector<any>(USER_STATE_NAME);

export const getUsers = createSelector(getUserState, (state) => state.users);
export const getUserCount = createSelector(getUserState, (state) => state.count);

export const selectAllRoles = createSelector(
  getRoleState,
  (state) => state.roles  
);


export const selectAllbaseRoles = createSelector(
  getRoleState,
  (state) => state.roles
);

export const selectRoleError = createSelector(
  getRoleState,
  (state) => state.error
);

export const selectCustomers = createSelector(
  getUserState,
  (state) => state.customers
);



export const selectDepartments = createSelector(
  getUserState,
  (state) => state.departments
);


export const getDepartmentUsers = createSelector(
  getUserState,
  (state) => state.departmentUsers
);


export const getAccountTypes = createSelector(
  getUserState,
  (state) => state.accountTypes
);


export const getPowerCosts = createSelector(
  getUserState,
  (state) => state.powerCosts
);

export const getoverheads = createSelector(
  getUserState,
  (state) => state.data
);