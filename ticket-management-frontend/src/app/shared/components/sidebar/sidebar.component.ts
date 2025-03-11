import { Component, Input, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { AuthState } from "../../../features/auth/store/auth.reducer";
import { Router } from "@angular/router";
import { AsyncPipe, NgIf } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import * as AuthActions from '../../../features/auth/store/auth.action';
import {WebsocketService} from "../../../core/service/websocket/websocket.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    LucideAngularModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() userRole$: Observable<string | null> | undefined;

  constructor(
    private readonly store: Store<{auth: AuthState}>,
    private readonly router: Router,
    private readonly webSocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.userRole$ = this.store.select((state) => state.auth.role);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  handleKeyDown(event: KeyboardEvent, route: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateTo(route);
    }
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
