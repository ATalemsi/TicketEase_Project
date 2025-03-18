import {inject} from '@angular/core';
import {AuthService} from "../service/auth/auth.service";
import {HttpInterceptorFn} from "@angular/common/http";
import {catchError, throwError} from "rxjs";
import {Router} from "@angular/router";


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.includes('/auth/') || req.method === 'OPTIONS') {
    return next(req);
  }

  const token = authService.getToken();

  if (token && !authService.isTokenExpired(token)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else if (token) {
    authService.logout();
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        console.warn('Unauthorized request detected. Redirecting to login.');
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

