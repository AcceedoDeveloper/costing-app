import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { createUser, createUserSuccess, loadUsers, loadUsersSuccess, 
  loadUsersFailure, updateUser, updateUserFailure, updateUserSuccess
, deleteUser, deleteUserFailure, deleteUserSuccess } from './master.action';
import { User } from '../../../models/users.model';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private userService: UserService, private toastr: ToastrService) {}

  createUser$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(createUser),
    mergeMap((action) => {
      return this.userService.addUser(action.user).pipe(
        map((response) => {
          const user = { ...action.user, id: response.id || 'temp-id' };
          this.toastr.success('User created successfully!', 'Success'); // ✅ success toast
          return createUserSuccess({ user });
        }),
        catchError((error) => {
          this.toastr.error('Failed to create user.', 'Error'); // ✅ error toast
          console.error('Error creating user:', error);
          return of({ type: '[User] Create User Failed' });
        })
      );
    })
  );
});

  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUsers),
      mergeMap(() => {
        return this.userService.getUsers().pipe(
          map((users) => {
            
            return loadUsersSuccess({ users });
          }),
          catchError((error) => {
            this.toastr.error('Failed to load users.', 'Error');
            console.error('Error loading users:', error);
            return of(loadUsersFailure({ error: error.message }));
          })
        );
      })
    );
  });

  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateUser),
      mergeMap((action) => {
        console.log(action);
        return this.userService.updateUser(action.user).pipe(
          map((response) => {
            this.toastr.success('User updated successfully!', 'Success');
            return updateUserSuccess({ user: response });
          }),
          catchError((error) => {
            this.toastr.error('Failed to update user.', 'Error');
            console.error('Error updating user:', error);
            return of(updateUserFailure({ error: error.message }));
          })
        );
      })
    );
  });

  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteUser),
      mergeMap((action) => {
        return this.userService.deleteUser(action.id).pipe(
          map(() => {
            this.toastr.success('User deleted successfully!', 'Success');
            return deleteUserSuccess({ id: action.id });
          }),
          catchError((error) => {
            this.toastr.error('Failed to delete user.', 'Error');
            console.error('Error deleting user:', error);
            return of(deleteUserFailure({ error: error.message }));
          })
        );
      })
    );
  });
  
}