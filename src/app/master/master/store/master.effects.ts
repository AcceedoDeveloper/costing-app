import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import * as UserActions from './master.action';
import * as RoleActions from './master.action';

import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';  // Assuming you have RoleService

import { ToastrService } from 'ngx-toastr';
import {loadbaseRoles, loadbaseRolesSuccess, loadRolesFailure} from './master.action';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private roleService: RoleService,
    private toastr: ToastrService
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
}
