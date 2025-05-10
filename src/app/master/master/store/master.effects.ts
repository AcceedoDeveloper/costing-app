import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { createUser, createUserSuccess } from './master.action';
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

  
}