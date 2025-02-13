import {inject} from '@angular/core';
import {AuthService} from "../service/auth/auth.service";
import {HttpInterceptorFn} from "@angular/common/http";


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

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

  return next(req);
};

