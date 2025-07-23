import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/users.model';
import {Role} from '../../../models/role.model';
import { Roles } from 'src/app/models/MaterialMap.model';
import { Customer } from '../../../models/role.model';
import { Department } from '../../../models/users.model';
import { PowerCost } from '../../../models/over-head.model';
import { Overheads} from '../../../models/over-head.model';

export const CREATE_USER = '[user page] create user';
export const CREATE_USER_SUCCESS = '[user page] create user success';

export const LOAD_USERS = '[user page] load users';
export const LOAD_USERS_SUCCESS = '[user page] load users success';
export const LOAD_USERS_FAILURE = '[user page] load users failure';

export const UPDATE_USER = '[user page] update user';
export const UPDATE_USER_SUCCESS = '[user page] update user success';
export const UPDATE_USER_FAILURE = '[user page] update user failure';

export const DELETE_USER = '[user page] delete user';
export const DELETE_USER_SUCCESS = '[user page] delete user success';
export const DELETE_USER_FAILURE = '[user page] delete user failure';

export const createUser = createAction(CREATE_USER, props<{ user: User }>());
export const createUserSuccess = createAction(CREATE_USER_SUCCESS, props<{ user: User }>());

export const loadUsers = createAction(LOAD_USERS);
export const loadUsersSuccess = createAction(LOAD_USERS_SUCCESS, props<{ users: User[] }>());
export const loadUsersFailure = createAction(LOAD_USERS_FAILURE, props<{ error: string }>());

export const updateUser = createAction(UPDATE_USER, props<{ user: User }>());
export const updateUserSuccess = createAction(UPDATE_USER_SUCCESS, props<{ user: User }>());
export const updateUserFailure = createAction(UPDATE_USER_FAILURE, props<{ error: string }>());

export const deleteUser = createAction(DELETE_USER, props<{ id: string }>());
export const deleteUserSuccess = createAction(DELETE_USER_SUCCESS, props<{ id: string }>());
export const deleteUserFailure = createAction(DELETE_USER_FAILURE, props<{ error: string }>());




export const loadRoles = createAction('[Role] Load Roles');
export const loadRolesSuccess = createAction('[Role] Load Roles Success', props<{ roles: Role[] }>());
export const loadRolesFailure = createAction('[Role] Load Roles Failure', props<{ error: string }>());

export const addRole = createAction('[Role] Add Role', props<{ role: Partial<Role> }>());
export const addRoleSuccess = createAction('[Role] Add Role Success', props<{ role: Role }>());
export const addRoleFailure = createAction('[Role] Add Role Failure', props<{ error: string }>());

export const updateRole = createAction('[Role] Update Role', props<{ id: string; role: Partial<Role> }>());
export const updateRoleSuccess = createAction('[Role] Update Role Success', props<{ role: Role }>());
export const updateRoleFailure = createAction('[Role] Update Role Failure', props<{ error: string }>());

export const deleteRole = createAction('[Role] Delete Role', props<{ id: string }>());
export const deleteRoleSuccess = createAction('[Role] Delete Role Success', props<{ id: string }>());
export const deleteRoleFailure = createAction('[Role] Delete Role Failure', props<{ error: string }>());


export const loadbaseRoles = createAction('[Roles] Load Roles');
export const loadbaseRolesSuccess = createAction('[Role] Load Roles Success', props<{ roles: Roles[] }>());
export const loadbaseRolesFailure = createAction('[Role] Load Roles Failure', props<{ error: string }>());

export const loadCustomers = createAction('[Customer] Load Customers');
export const loadCustomersSuccess = createAction(
  '[Customer] Load Customers Success',
  props<{ customers: Customer[] }>()
);
export const loadCustomersFailure = createAction(
  '[Customer] Load Customers Failure',
  props<{ error: string }>()
);


export const updateCustomer = createAction(
  '[Customer] Update Customer',
  props<{ id: string; data: Partial<Customer> }>()
);

export const updateCustomerSuccess = createAction(
  '[Customer] Update Customer Success',
  props<{ customer: Customer }>()
);

export const updateCustomerFailure = createAction(
  '[Customer] Update Customer Failure',
  props<{ error: string }>()
);



export const addCustomer = createAction(
  '[Customer] Add Customer',  
  props<{ customer: Partial<Customer> }>()
);

export const addCustomerSuccess = createAction(
  '[Customer] Add Customer Success',
  props<{ customer: Customer }>()
);


export const addCustomerFailure = createAction(
  '[Customer] Add Customer Failure',
  props<{ error: string }>()
);


export const deleteCustomer = createAction(
  '[Customer] Delete Customer',
  props<{ id: string }>()
);


export const deleteCustomerSuccess = createAction(
  '[Customer] Delete Customer Success',
  props<{ id: string }>()
);

export const deleteCustomerFailure = createAction(
  '[Customer] Delete Customer Failure',
  props<{ error: string }>()
);


export const loadDepartments = createAction('[Department] Load Departments');
export const loadDepartmentsSuccess = createAction(
  '[Department] Load Departments Success',
  props<{ departments: Department[] }>()
);
export const loadDepartmentsFailure = createAction(
  '[Department] Load Departments Failure',
  props<{ error: string }>()
);


export const addDepartment = createAction(
  '[Department] Add Department',
  props<{ department: Partial<Department> }>()
);

export const addDepartmentSuccess = createAction(
  '[Department] Add Department Success',
  props<{ department: Department }>()
);

export const addDepartmentFailure = createAction(
  '[Department] Add Department Failure',
  props<{ error: string }>()
);

export const updateDepartment = createAction(
  '[Department] Update Department',
  props<{ id: string; data: Partial<Department> }>()
);

export const updateDepartmentSuccess = createAction(
  '[Department] Update Department Success',
  props<{ department: Department }>()
);

export const updateDepartmentFailure = createAction(
  '[Department] Update Department Failure',
  props<{ error: string }>()
);


export const deleteDepartment = createAction(
  '[Department] Delete Department',
  props<{ id: string }>()
);

export const deleteDepartmentSuccess = createAction(
  '[Department] Delete Department Success',
  props<{ id: string }>()
);

export const deleteDepartmentFailure = createAction(
  '[Department] Delete Department Failure',
  props<{ error: string }>()
);


export const loadDepartmentUsers = createAction(
  '[Department] Load Department Users'
);

export const loadDepartmentUsersSuccess = createAction(
  '[Department] Load Department Users Success',
  props<{ users: { _id: string; name: string }[] }>()
);

export const loadDepartmentUsersFailure = createAction(
  '[Department] Load Department Users Failure',
  props<{ error: string }>()
);







export const updateAccountTypeFailure = createAction(
  '[AccountType] Update Failure',
  props<{ error: any }>()
);

export const deleteAccountType = createAction(
  '[AccountType] Delete',
  props<{ id: string }>()
);
export const deleteAccountTypeSuccess = createAction(
  '[AccountType] Delete Success',
  props<{ id: string }>()
);
export const deleteAccountTypeFailure = createAction(
  '[AccountType] Delete Failure',
  props<{ error: any }>()
);


export const loadPowerCosts = createAction('[PowerCost] Load Power Costs');
export const loadPowerCostsSuccess = createAction(
  '[PowerCost] Load Power Costs Success',
  props<{ powerCosts: PowerCost[] }>()
);
export const error = createAction(
  '[PowerCost] Load Power Costs Failure',
  props<{ error: string }>()
);



export const loadOverheads = createAction(
  '[Overheads] Load Overheads',
  props<{ startDate: string, endDate: string, yearNo: number }>()
);


export const loadOverheadsSuccess = createAction(
  '[Overheads] Load Overheads Success',
  props<{ data: Overheads[] }>()  // use correct model
);


export const loadOverheadsFailure = createAction(
  '[Overheads] Load Overheads Failure',
  props<{ error: any }>()
);



export const addOverhead = createAction(
  '[Overhead] Add Overhead',
  props<{ overhead: any }>()
);

export const addOverheadSuccess = createAction(
  '[Overhead] Add Overhead Success',
  props<{ overhead: any }>()
);

export const addOverheadFailure = createAction(
  '[Overhead] Add Overhead Failure',
  props<{ error: any }>()
);



export const updateOverhead = createAction(
  '[Overheads] Update Overhead',
  props<{ id: string, overhead: Partial<Overheads> }>()
);

export const updateOverheadSuccess = createAction(
  '[Overhead] Update Success',
  props<{ response: any }>()
);

export const updateOverheadFailure = createAction(
  '[Overhead] Update Failure',
  props<{ error: any }>()
);
