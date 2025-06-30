import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

import * as UserActions from './master.action';
import * as RoleActions from './master.action';

import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';  // Assuming you have RoleService

import { ToastrService } from 'ngx-toastr';
import { OverHead } from '../../../models/over-head.model';
import { GradeService } from '../../../services/grade.service';
import {loadbaseRoles, loadbaseRolesSuccess, loadRolesFailure} from './master.action';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private roleService: RoleService,
    private toastr: ToastrService,
    private gradeService: GradeService
  ) {}

  // User effects
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(action =>
        this.userService.addUser(action.user).pipe(
          map(response => {
            const user = { ...action.user, id: response.id || 'temp-id' };
            this.toastr.success('User created successfully!', 'Success');
            return UserActions.createUserSuccess({ user });
          }),
          catchError(error => {
            this.toastr.error('Failed to create user.', 'Error');
            console.error('Error creating user:', error);
            return of({ type: '[User] Create User Failed' });
          })
        )
      )
    )
  );

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      mergeMap(() =>
        this.userService.getUsers().pipe(
          map(users => UserActions.loadUsersSuccess({ users })),
          catchError(error => {
            this.toastr.error('Failed to load users.', 'Error');
            console.error('Error loading users:', error);
            return of(UserActions.loadUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(action =>
        this.userService.updateUser(action.user).pipe(
          map(response => {
            this.toastr.success('User updated successfully!', 'Success');
            return UserActions.updateUserSuccess({ user: response });
          }),
          catchError(error => {
            this.toastr.error('Failed to update user.', 'Error');
            console.error('Error updating user:', error);
            return of(UserActions.updateUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap(action =>
        this.userService.deleteUser(action.id).pipe(
          map(() => {
            this.toastr.success('User deleted successfully!', 'Success');
            return UserActions.deleteUserSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete user.', 'Error');
            console.error('Error deleting user:', error);
            return of(UserActions.deleteUserFailure({ error: error.message }));
          })
        )
      )
    )
  );

 loadRoles$ = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.loadRoles),
    mergeMap(() =>
      this.roleService.getRoles().pipe(
        map(roles => {
          console.log('Loaded roles:', roles);  // Confirm this log appears
          return RoleActions.loadRolesSuccess({ roles });
        }),
        catchError(error => {
          console.error('Error loading roles:', error);
          return of(RoleActions.loadRolesFailure({ error: error.message }));
        })
      )
    )
  )
);


  addRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.addRole),
      mergeMap(action =>
        this.roleService.addRole(action.role).pipe(
          map(role => {
            this.toastr.success('Role added successfully!', 'Success');
            return RoleActions.addRoleSuccess({ role });
          }),
          catchError(error => {
            this.toastr.error('Failed to add role.', 'Error');
            console.error('Error adding role:', error);
            return of(RoleActions.addRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.updateRole),
      mergeMap(action =>
        this.roleService.updateRole(action.id, action.role).pipe(
          map(role => {
            this.toastr.success('Role updated successfully!', 'Success');
            return RoleActions.updateRoleSuccess({ role });
          }),
          catchError(error => {
            this.toastr.error('Failed to update role.', 'Error');
            console.error('Error updating role:', error);
            return of(RoleActions.updateRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.deleteRole),
      mergeMap(action =>
        this.roleService.deleteRole(action.id).pipe(
          map(() => {
            this.toastr.success('Role deleted successfully!', 'Success');
            return RoleActions.deleteRoleSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete role.', 'Error');
            console.error('Error deleting role:', error);
            return of(RoleActions.deleteRoleFailure({ error: error.message }));
          })
        )
      )
    )
  );



  loadbaseRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoleActions.loadbaseRoles),
      mergeMap(() =>
        this.roleService.getRoles().pipe(
          map(roles => RoleActions.loadbaseRolesSuccess({ roles })),
          catchError(error => of(RoleActions.loadbaseRolesFailure({ error: error.message })))
        )
      )
    )
  );


  
loadCustomers$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.loadCustomers),
    mergeMap(() =>
      this.roleService.getCustomers().pipe(
        tap(customers => {
          console.log('Loaded customers:', customers);
        }),
        map(customers => UserActions.loadCustomersSuccess({ customers })),
        catchError(error => {
          console.error('Error loading customers:', error);
          return of(UserActions.loadCustomersFailure({ error: error.message }));
        })
      )
    )
  )
);


updateCustomer$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.updateCustomer),
    mergeMap(({ id, data }) =>
      this.roleService.updateCustomer(id, data).pipe(
        map((customer) => {
          this.toastr.success('Customer updated successfully!', 'Success');
          return UserActions.updateCustomerSuccess({ customer });
        }),
        catchError((error) =>{
          this.toastr.error('Failed to update customer.', 'Error');
          console.error('Error updating customer:', error);
          return of(UserActions.updateCustomerFailure({ error: error.message }));
        })
      )
    )
  )
);

addCustomer$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.addCustomer),
    mergeMap(({ customer }) =>
      this.roleService.addCustomer(customer).pipe(
        map((newCustomer) => {
          this.toastr.success('Customer added successfully!', 'Success');
          return UserActions.addCustomerSuccess({ customer: newCustomer });
        }),
        catchError((error) =>{
          this.toastr.error('Failed to add customer.', 'Error');
          console.error('Error adding customer:', error);
          return of(UserActions.addCustomerFailure({ error: error.message }));
        })
      )
    )
  )
);

deleteCustomer$ = createEffect(() =>
  this.actions$.pipe(
    ofType(UserActions.deleteCustomer),
    mergeMap(({ id }) =>
      this.roleService.deleteCustomer(id).pipe(
        map(() => {
          this.toastr.success('Customer deleted successfully!', 'Success');
          return UserActions.deleteCustomerSuccess({ id });
        }),
        catchError((error) =>{
          this.toastr.error('Failed to delete customer.', 'Error');
          console.error('Error deleting customer:', error);
          return of(UserActions.deleteCustomerFailure({ error: error.message }));
        })
      )
    )
  )
);

  loadDepartments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadDepartments),
      mergeMap(() =>
        this.roleService.getDepartments().pipe(
          map(departments => UserActions.loadDepartmentsSuccess({ departments })),
          catchError(error => {
            console.error('Error loading departments:', error);
            return of(UserActions.loadDepartmentsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  addDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.addDepartment),
      mergeMap(action =>
        this.roleService.addDepartment(action.department).pipe(
          map(department => {
            this.toastr.success('Department added successfully!', 'Success');
            return UserActions.addDepartmentSuccess({ department });
          }),
          catchError(error => {
            this.toastr.error('Failed to add department.', 'Error');
            console.error('Error adding department:', error);
            return of(UserActions.addDepartmentFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateDepartment),
      mergeMap(action =>
        this.roleService.updateDepartment(action.id, action.data).pipe(
          map(department => {
            this.toastr.success('Department updated successfully!', 'Success');
            return UserActions.updateDepartmentSuccess({ department });
          }),
          catchError(error => {
            this.toastr.error('Failed to update department.', 'Error');
            console.error('Error updating department:', error);
            return of(UserActions.updateDepartmentFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteDepartment),
      mergeMap(action =>
        this.roleService.deleteDepartment(action.id).pipe(
          map(() => {
            this.toastr.success('Department deleted successfully!', 'Success');
            return UserActions.deleteDepartmentSuccess({ id: action.id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete department.', 'Error');
            console.error('Error deleting department:', error);
            return of(UserActions.deleteDepartmentFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadDepartmentUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadDepartmentUsers),
      mergeMap(() =>
        this.roleService.getDepartmentUsers().pipe(
          map(users => UserActions.loadDepartmentUsersSuccess({ users })),
          catchError(error => {
            console.error('Error loading department users:', error);
            return of(UserActions.loadDepartmentUsersFailure({ error: error.message }));
          })
        )
      )
    )
  );




loadAccountTypesEffect = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.loadAccountTypes),
    mergeMap(() =>
      this.gradeService.getAccountTypes().pipe(
        
        map(accountTypes =>
          RoleActions.loadAccountTypesSuccess({ accountTypes })
        ),
        catchError(error =>
          of(RoleActions.loadAccountTypesFailure({ error }))
        )
      )
    )
  )
);


  
createAccountTypeEffect = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.addAccountType),
    mergeMap(action =>
      this.gradeService.addAccountType(action.account).pipe(
        map(account => {
          this.toastr.success('Account type added successfully!', 'Success');
          return RoleActions.addAccountTypeSuccess({ account });
        }),
        catchError(error => {
          this.toastr.error('Failed to add account type.', 'Error');
          console.error('Add Account Type Error:', error);
          return of(RoleActions.addAccountTypeFailure({ error }));
        })
      )
    )
  )
);


updateAccountTypeEffect = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.updateAccountType),
    mergeMap(action =>
      this.gradeService.updateAccountType(action.id, action.account).pipe(
        map(account => {
          this.toastr.success('Account type updated successfully!', 'Success');
          return RoleActions.updateAccountTypeSuccess({ account });
        }),
        catchError(error => {
          this.toastr.error('Failed to update account type.', 'Error');
          console.error('Update Account Type Error:', error);
          return of(RoleActions.updateAccountTypeFailure({ error }));
        })
      )
    )
  )
);


deleteAccountTypeEffect = createEffect(() =>
  this.actions$.pipe(
    ofType(RoleActions.deleteAccountType),
    mergeMap(action =>
      this.gradeService.deleteAccountType(action.id).pipe(
        map(() => {
          this.toastr.success('Account type deleted successfully!', 'Success');
          return RoleActions.deleteAccountTypeSuccess({ id: action.id });
        }),
        catchError(error => {
          this.toastr.error('Failed to delete account type.', 'Error');
          console.error('Delete Account Type Error:', error);
          return of(RoleActions.deleteAccountTypeFailure({ error }));
        })
      )
    )
  )
);



}
