import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AuthState } from '../../features/auth/store/auth.reducer';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt'; // Import JwtHelperService

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly jwtHelper = new JwtHelperService(); // Create an instance of JwtHelperService

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private readonly router: Router
  ) {}

  canActivate(route: any): Observable<boolean> {
    const requiredRole = route?.data?.requiredRole || ''; // Get the required role from route data

    return this.store.select((state) => state.auth).pipe(
      take(1),
      map((authState) => {
        console.log('Auth State in Guard:', authState);
        // Handle authenticated users
        if (authState.isAuthenticated) {
          // Prevent authenticated users from accessing login/register
          if (route.routeConfig?.path === 'login' || route.routeConfig?.path === 'register') {
            this.redirectBasedOnRole(authState.role!);
            return false; // Deny access to login/register for authenticated users
          }

          // Check if the user has the required role for the route
          if (requiredRole && authState.role !== requiredRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }

          return true; // Allow access to the route
        }

        // Handle unauthenticated users
        if (!authState.isAuthenticated) {
          // Allow access to login/register for unauthenticated users
          if (route.routeConfig?.path === 'login' || route.routeConfig?.path === 'register') {
            return true;
          }

          // Redirect unauthenticated users to login
          this.router.navigate(['/login']);
          return false;
        }

        return false; // Default fallback
      })
    );
  }


  private redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'CLIENT':
        this.router.navigate(['/client/dashboard']);
        break;
      case 'AGENT':
        this.router.navigate(['/agent/dashboard']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}
