import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import * as AuthActions from './auth.action';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { AuthService } from '../../../core/service/auth/auth.service';

@Injectable()
export class AuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            console.log('Login Response:', response); // Debug log
            this.authService.setToken(response.token);
            console.log('Dispatching loginSuccess'); // Debug log
            return AuthActions.loginSuccess({
              token: response.token,
              email: response.email,
              role: response.role
            });
          }),
          catchError(error => {
            console.error('Login Error:', error);
            let errorMessage = error.error?.message || 'Login failed';
            if (error.status === 403 || error.message.includes('banned')) { // Handle banned users
              errorMessage = 'Your account has been banned. Please contact support.';
            }
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ email, password, fullName, role }) =>
        this.authService.register(email, password, fullName, role).pipe(
          map((response) => {
            this.authService.setToken(response.token);
            return AuthActions.registerSuccess({
              token: response.token,
              email: response.email,
              role: response.role
            });
          }),
          catchError(error => {
            let errorMessage = 'Registration failed';
            if (error.status === 409) {
              errorMessage = 'Email already exists';
            }
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => {
            this.authService.setToken('');
            return AuthActions.logoutSuccess();
          }),
          catchError(() => {
            this.authService.setToken('');
            return of(AuthActions.logoutSuccess());
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(({ token, role }) => {
          console.log('Redirecting user based on role:', role); // Debug log
          this.authService.setToken(token);
          // Redirect based on user role
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']); // Redirect to admin dashboard
          } else if (role === 'CLIENT') {
            this.router.navigate(['/client/dashboard']); // Redirect to client dashboard
          } else if (role === 'AGENT') {
            this.router.navigate(['/agent/dashboard']); // Redirect to agent dashboard
          } else {
            this.router.navigate(['/client/dashboard']); // Default fallback
          }
        })
      ),
    { dispatch: false }
  );


  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.authService.setToken('');
          this.router.navigate(['/login']); // Redirect to login page after logout
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}
}
