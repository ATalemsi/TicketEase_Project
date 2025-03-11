import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {User} from "../../../shared/models/ticket-response.model";
import {selectError, selectLoading, selectUsers} from "../store/admin.selectors";
import {Store} from "@ngrx/store";
import {AdminActions} from "../store/admin.actions";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {AuthState} from "../../auth/store/auth.reducer";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    SidebarComponent,
    AsyncPipe,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit{
  users$: Observable<User[] | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  constructor(private readonly store: Store<{ auth: AuthState }>) {
    this.users$ = this.store.select(selectUsers);
    this.loading$ = this.store.select(selectLoading);
    this.error$ = this.store.select(selectError);
    this.userRole$ = this.store.select((state) => state.auth.role);
  }

  ngOnInit(): void {
    this.loadUsers();
    console.log(this.users$);
  }

  loadUsers(): void {
    this.store.dispatch(AdminActions.loadUsers());
  }

  toggleUserStatus(userId: number, currentStatus: boolean): void {
    this.store.dispatch(AdminActions.updateUserStatus({
      userId,
      active: !currentStatus
    }));
  }

  getRoleClass(role: string): string {
    return role === 'AGENT' ?
      'bg-blue-100 text-blue-800' :
      'bg-purple-100 text-purple-800';
  }

  getStatusClass(active: boolean): string {
    return active ?
      'bg-green-100 text-green-800' :
      'bg-red-100 text-red-800';
  }

}
