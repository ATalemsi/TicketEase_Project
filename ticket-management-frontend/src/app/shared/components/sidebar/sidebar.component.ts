import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AuthState} from "../../../features/auth/store/auth.reducer";
import {Route, Router} from "@angular/router";
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  userRole$: Observable<string | null> | undefined;
  constructor(private readonly store: Store<{auth: AuthState}> , private readonly router: Router) {
  }
  ngOnInit(): void {
    this.userRole$ = this.store.select((state) => state.auth.role);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  handleKeyDown(event: KeyboardEvent, route: string): void {
    // Handle both Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent page scroll on space
      this.navigateTo(route);
    }
  }
}
