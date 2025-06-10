import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AdduserComponent } from './adduser/adduser.component';
import { loadUsers, deleteUser } from '../store/master.action';
import { Store } from '@ngrx/store';
import { getUsers, getUserCount } from '../store/master.selector';
import { User } from '../../../models/users.model';
import { Observable } from 'rxjs';
import { Userget } from '../../../models/users.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PageEvent } from '@angular/material/paginator';



@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})


export class MasterComponent implements OnInit {
   users: User[] = [];
  paginatedUsers: User[] = [];
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  users$: Observable<User[]>;
  userCount$: Observable<number>;
  dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['UserCode', 'UserName', 'department', 'role', 'actions', 'delete'];

 

  constructor(private dialog: MatDialog, private store: Store) {
    this.users$ = this.store.select(getUsers);
    this.userCount$ = this.store.select(getUserCount);
  }

  ngOnInit() {
  


    this.store.dispatch(loadUsers());
    this.store.select(getUsers).subscribe(users => {
    console.log('Users from Store:', users);
    this.dataSource.data = users;
    this.dataSource.paginator = this.paginator;
     this.users$.subscribe(users => {
      this.users = users;
      this.updatePaginatedUsers();
    });
  });
    this.users$.subscribe(users => {
      console.log("data", users);
      this.dataSource.data = users;
      this.dataSource.paginator = this.paginator;
    });
  }

  updatePaginatedUsers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.users.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openAddUserPopup() {
    this.dialog.open(AdduserComponent, {
      width: '450px',
    });
  }

  openEditUserPopup(user: Userget) {
    console.log('employee', user._id);
    this.dialog.open(AdduserComponent, {
      width: '450px',
      data: { user }
    });
  }

 deleteUser(user: Userget) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete user "${user.UserName}"?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(deleteUser({ id: user._id }));
      this.store.dispatch(loadUsers());
    }
  });
}

}