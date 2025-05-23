import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
import { Store } from '@ngrx/store';
import { autoLogout } from '../../auth/state/auth.actions';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  sidenavOpened: boolean = false; 
  disableClose: boolean = true;
  username = 'admin'; 
  role = 'Admin'; 

  isAdminMenuOpen: boolean = false;
  isMasterMenuOpen: boolean = false;

  constructor(
    private store: Store
  ) {}

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened; 
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.store.dispatch(autoLogout());
  }
}