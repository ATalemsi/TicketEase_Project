import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class SidebarService {
  private isSidebarOpenSubject = new BehaviorSubject<boolean>(true)
  private isMobileSubject = new BehaviorSubject<boolean>(false)

  isSidebarOpen$ = this.isSidebarOpenSubject.asObservable()
  isMobile$ = this.isMobileSubject.asObservable()

  constructor() {
    this.checkScreenSize()
    window.addEventListener("resize", () => this.checkScreenSize())
  }

  toggleSidebar(): void {
    this.isSidebarOpenSubject.next(!this.isSidebarOpenSubject.value)
  }

  closeSidebar(): void {
    this.isSidebarOpenSubject.next(false)
  }

  openSidebar(): void {
    this.isSidebarOpenSubject.next(true)
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 1024
    this.isMobileSubject.next(isMobile)

    // Auto-close sidebar on mobile
    if (isMobile && this.isSidebarOpenSubject.value) {
      this.isSidebarOpenSubject.next(false)
    } else if (!isMobile && !this.isSidebarOpenSubject.value) {
      this.isSidebarOpenSubject.next(true)
    }
  }
}

