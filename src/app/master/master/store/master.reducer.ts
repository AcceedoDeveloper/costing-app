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
  loadbaseRolesFailure,
  loadCustomersSuccess,
  loadCustomersFailure,
  updateCustomerSuccess,
  updateCustomerFailure,
  addCustomer,
  addCustomerSuccess,
  addCustomerFailure,
  deleteCustomerSuccess,
  deleteCustomerFailure,
  loadDepartments,
  loadDepartmentsSuccess,
  loadDepartmentsFailure,
  addDepartment,
  addDepartmentSuccess,
  addDepartmentFailure,
  updateDepartmentSuccess,
  updateDepartmentFailure,
  deleteDepartmentSuccess,
  deleteDepartmentFailure,
  loadDepartmentUsers,
  loadDepartmentUsersSuccess,
  loadDepartmentUsersFailure,
  loadAccountTypes,
  loadAccountTypesSuccess,
  loadAccountTypesFailure,
  addAccountType,
  addAccountTypeSuccess,
  addAccountTypeFailure,
  updateAccountType,
  updateAccountTypeSuccess,
  updateAccountTypeFailure,
  deleteAccountType,
  deleteAccountTypeSuccess,
  deleteAccountTypeFailure
} from '../store/master.action';
import * as RoleActions from '../store/master.action';  // Adjust path accordingly
import { User } from '../../../models/users.model';
import { Role, Customer } from '../../../models/role.model';  // Adjust path accordingly
import { Roles} from '../../../models/MaterialMap.model';
import { Department } from '../../../models/users.model';
import { DepartmentUser } from '../../../models/users.model';
import { OverHead } from '../../../models/over-head.model';

// --- User State ---
export interface UserState {
  rolesb:Roles[];
  roles: Role[];
  users: User[];
  customers: Customer[];
  departments: Department[];
  accountTypes: OverHead[];
  departmentUsers: DepartmentUser[];
  count: number;
  error?: string | null;

}

const initialUserState: UserState = {
  users: [],
  roles: [],
  count: 0,
  rolesb: [],
  customers: [],
  departments: [],
  departmentUsers: [],
  accountTypes: [],
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
  })),

  on(loadCustomersSuccess, (state, action) => ({
  ...state,
  customers: action.customers,
  error: null
})),
on(loadCustomersFailure, (state, action) => ({
  ...state,
  error: action.error
})),

on(updateCustomerSuccess, (state, { customer }) => ({
  ...state,
  customers: state.customers.map(c =>
    c._id === customer._id ? customer : c
  ),
  error: null
})),

on(updateCustomerFailure, (state, { error }) => ({
  ...state,
  error
})),

on(addCustomerSuccess, (state, { customer }) => ({
  ...state,
  customers: [...state.customers, customer],
  error: null
})),
on(addCustomerFailure, (state, { error }) => ({   
  ...state,
  error
})),

on(deleteCustomerSuccess, (state, { id }) => ({
  ...state,
  customers: state.customers.filter(c => c._id !== id),
  error: null
})),
on(deleteCustomerFailure, (state, { error }) => ({
  ...state,
  error
})),

on(loadDepartmentsSuccess, (state, { departments }) => ({
  ...state,
  departments: departments,
  error: null
})),

on(loadDepartmentsFailure, (state, { error }) => ({
  ...state,
  error
})),

on(addDepartmentSuccess, (state, { department }) => ({
  ...state,
  departments: [...state.departments, department],
  error: null
})),
on(addDepartmentFailure, (state, { error }) => ({
  ...state,
  error
})),

on(updateDepartmentSuccess, (state, { department }) => ({
  ...state,
  departments: state.departments.map(d =>
    d._id === department._id ? department : d
  ),
  error: null
})),
on(updateDepartmentFailure, (state, { error }) => ({
  ...state,
  error
})),

on(deleteDepartmentSuccess, (state, { id }) => ({
  ...state,
  departments: state.departments.filter(d => d._id !== id),
  error: null
})),
on(deleteDepartmentFailure, (state, { error }) => ({
  ...state,
  error
})),

on(loadDepartmentUsers, (state) => ({
  ...state,
  error: null
})),
on(loadDepartmentUsersSuccess, (state, { users }) => ({
  ...state,
  departmentUsers: users,
  error: null
})),
on(loadDepartmentUsersFailure, (state, { error }) => ({
  ...state,
  error
})),



 on(loadAccountTypes, state => ({ ...state, loading: true })),
  on(loadAccountTypesSuccess, (state, { accountTypes }) => ({
    ...state,
    accountTypes,
    loading: false
  })),
  on(loadAccountTypesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  on(addAccountTypeSuccess, (state, { account }) => ({
    ...state,
    accountTypes: [...state.accountTypes, account]
  })),

  on(updateAccountTypeSuccess, (state, { account }) => ({
    ...state,
    accountTypes: state.accountTypes.map(a =>
      a._id === account._id ? account : a
    )
  })),

  on(deleteAccountTypeSuccess, (state, { id }) => ({
    ...state,
    accountTypes: state.accountTypes.filter(a => a._id !== id)
  }))



);

export function userReducer(state: UserState | undefined, action: any) {
  const newState = _userReducer(state, action);
 
  return newState;
}











































































// --- Role State ---
export interface RoleState {
  customers: Customer[];
  roles: Role[];
  error: string | null;
}

const initialRoleState: RoleState = {
  customers: [],
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
  })),





);

export function roleReducer(state: RoleState | undefined, action: any) {
  const newState = _roleReducer(state, action);
  
  return newState;
}
