import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { autoLogout } from '../../auth/state/auth.actions';
import { selectAuthState } from '../../auth/state/auth.selector';
import { AppState } from '../../store/app.state';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  



  username: string = '';
  role: string = '';

  constructor(private store: Store<AppState>) {}


 
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



}
