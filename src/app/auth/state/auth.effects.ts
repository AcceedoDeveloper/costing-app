import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { loginStart, loginSuccess, loginFail, autoLogout, autoLogin } from './auth.actions';
import { AuthService } from '../../services/auth.service';
import { setLoadingSpinner } from '../../store/Shared/shared.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private store: Store<AppState>
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginStart),
      exhaustMap((action) =>
        this.authService.login(action.username, action.password).pipe(
          map((response) => {
            const user = this.authService.formatUser(response);
            this.authService.setUserInLocalStorage(user);
            return loginSuccess({ user, token: response.token });
          }),
          catchError((error) => {
            const customError =
              error?.error?.message || 'Unknown error occurred. Please try again.';
            return of(loginFail({ error: customError }));
          })
        )
      )
    )
  );



  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(() => {
          this.store.dispatch(setLoadingSpinner({ status: false }));
        })
      ),
    { dispatch: false }
  );

  loginFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginFail),
        tap(() => {
          this.store.dispatch(setLoadingSpinner({ status: false }));
        })
      ),
    { dispatch: false }
  );

  autoLogout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(autoLogout),
        tap(() => {
          this.authService.logout();
        })
      ),
    { dispatch: false }
  );
}