import { Component, HostListener, AfterViewInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { autoLogout } from '../../auth/state/auth.actions';
import { selectAuthState } from '../../auth/state/auth.selector';
import { AppState } from '../../store/app.state';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { slideInAnimation } from '../../animations/route-animations';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  animations: [slideInAnimation]
})
export class MainLayoutComponent implements AfterViewInit {
  



  username: string = '';
  role: string = '';

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit(): void {
    this.setupSubmenuPositioning();
  }

  setupSubmenuPositioning(): void {
    const navItems = document.querySelectorAll('.nav-item.has-submenu');
    navItems.forEach((navItem) => {
      navItem.addEventListener('mouseenter', (e) => {
        const item = e.currentTarget as HTMLElement;
        const submenu = item.querySelector('.submenu') as HTMLElement;
        if (submenu) {
          const rect = item.getBoundingClientRect();
          submenu.style.top = `${rect.top}px`;
          submenu.style.left = `${rect.right + 4}px`;
        }
      });
    });
  }
 
 ngOnInit(): void {
    this.store.select(selectAuthState).subscribe((authState) => {
      if (authState.user) {
        this.username = authState.user.userName || 'unknown';
        if( this.username === 'admin') {
          this.role = 'admin';
        }
        else{
          this.role = authState.user.role || 'unknown';
        }
        console.log('User:', this.username, 'Role:', this.role);
      }
    });
  }


 



  onLogout(event: Event): void {
    event.preventDefault();
    console.log('Logout triggered');
    this.store.dispatch(autoLogout());
    localStorage.removeItem('userData');
  }

  getRouteAnimationData() {
    return 'routeAnimation';
  }

}
