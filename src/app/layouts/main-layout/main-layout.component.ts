import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { autoLogout } from '../../auth/state/auth.actions';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  // UI State
  sidenavOpened: boolean = false;
  isAdminMenuOpen: boolean = false;
  isMaterialInputOpen: boolean = false;
  isMasterMenuOpen: boolean = false;

  // User info (you can replace with real auth values)
  username: string = 'admin';
  role: string = 'Admin';

  constructor(private store: Store) {}

  // Toggle sidebar
  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
    console.log('Sidenav opened:', this.sidenavOpened);

    // Close all submenus when sidebar is collapsed
    if (!this.sidenavOpened) {
      this.isAdminMenuOpen = false;
      this.isMaterialInputOpen = false;
      this.isMasterMenuOpen = false;
    }
  }

  // Toggle Admin menu
  toggleAdminMenu(): void {
    if (this.sidenavOpened) {
      this.isAdminMenuOpen = !this.isAdminMenuOpen;
      console.log('Admin Menu:', this.isAdminMenuOpen);
    }
  }

  // Toggle Material Input submenu
  toggleMaterialInputMenu(): void {
    if (this.sidenavOpened) {
      this.isMaterialInputOpen = !this.isMaterialInputOpen;
      console.log('Material Input Menu:', this.isMaterialInputOpen);
    }
  }

  // Toggle Master submenu
  toggleMasterMenu(): void {
    if (this.sidenavOpened) {
      this.isMasterMenuOpen = !this.isMasterMenuOpen;
      console.log('Master Menu:', this.isMasterMenuOpen);
    }
  }

  // Dispatch logout action
  onLogout(event: Event): void {
    event.preventDefault();
    console.log('Logout triggered');
    this.store.dispatch(autoLogout());
  }
}
