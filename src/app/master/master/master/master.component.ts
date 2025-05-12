import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdduserComponent} from './adduser/adduser.component';
import { loadUsers } from '../store/master.action';
import { Store } from '@ngrx/store';
import { getUsers, getUserCount } from '../store/master.selector';
import { User } from '../../../models/users.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {
  users$: Observable<User[]>;
  userCount$: Observable<number>;
   

  constructor(private dialog: MatDialog,private store: Store) {
    this.users$ = this.store.select(getUsers);
    this.userCount$ = this.store.select(getUserCount);
  }

  ngOnInit() {
    this.store.dispatch(loadUsers());
  }
  openAddUserPopup() {
    this.dialog.open(AdduserComponent, {
      width: '400px',
    });
  }

}
