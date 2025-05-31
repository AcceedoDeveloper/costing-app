import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { autoLogout } from '../../auth/state/auth.actions';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  



  username: string = 'admin';
  role: string = 'Admin';

  constructor(private store: Store) {}

 



 



  onLogout(event: Event): void {
    event.preventDefault();
    console.log('Logout triggered');
    this.store.dispatch(autoLogout());
  }



}
