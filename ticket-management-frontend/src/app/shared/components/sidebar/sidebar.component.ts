import { Component, Input,  OnInit } from "@angular/core"
import  { Observable } from "rxjs"
import  { Store } from "@ngrx/store"
import  { AuthState } from "../../../features/auth/store/auth.reducer"
import  { Router } from "@angular/router"
import { AsyncPipe, NgIf } from "@angular/common"
import { LucideAngularModule } from "lucide-angular"
import * as AuthActions from "../../../features/auth/store/auth.action"
import  { WebsocketService } from "../../../core/service/websocket/websocket.service"
import { selectUserId, selectUsername } from "../../../features/auth/store/auth.selectors"

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [AsyncPipe, NgIf, LucideAngularModule],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent implements OnInit {
  @Input() userRole$: Observable<string | null> | undefined

  username$: Observable<string | null>
  userId$: Observable<string | null>

  constructor(
    private readonly store: Store<{ auth: AuthState }>,
    private readonly router: Router,
    private readonly webSocketService: WebsocketService,
  ) {
    this.username$ = this.store.select(selectUsername)
    this.userId$ = this.store.select(selectUserId)
  }

  ngOnInit(): void {
    this.userRole$ = this.store.select((state) => state.auth.role)
  }

  navigateTo(route: string): void {
    this.router.navigate([route])
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout())
    this.webSocketService.disconnect()
    localStorage.removeItem("token")
    localStorage.removeItem("notifications")
  }

  /**
   * Generate initials from username/email
   * @param username The username or email to generate initials from
   * @returns The first two characters of the username, or first characters of each part of an email
   */
  getInitials(username: string): string {
    if (!username) return "U"

    // If it's an email, use first letter of each part
    if (username.includes("@")) {
      const parts = username.split("@")[0].split(".")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return username.substring(0, 2).toUpperCase()
    }

    // Otherwise use first two letters of username
    return username.substring(0, 2).toUpperCase()
  }
}

