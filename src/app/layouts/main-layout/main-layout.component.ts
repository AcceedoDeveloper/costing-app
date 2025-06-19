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
      }
    });
  }


 



  onLogout(event: Event): void {
    event.preventDefault();
    console.log('Logout triggered');
    this.store.dispatch(autoLogout());
  }



}
