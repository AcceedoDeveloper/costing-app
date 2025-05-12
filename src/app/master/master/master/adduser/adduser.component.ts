import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { createUser, updateUser } from '../../store/master.action';
import { getUsers, getUserCount } from '../../store/master.selector';
import { User } from '../../../../models/users.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
  users$: Observable<User[]>;
  count$: Observable<number>;
  userForm: FormGroup;
  isEditMode: boolean = false;
  editUserId: string | null = null;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdduserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.users$ = this.store.select(getUsers);
    this.count$ = this.store.select(getUserCount);

    // Initialize form with fields required by the server
    this.userForm = this.fb.group({
      UserCode: ['', this.data?.user ? [] : [Validators.required]], // Required only for create
      UserName: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (data?.user) {
      this.isEditMode = true;
      this.editUserId = data.user.id ;

      
      this.userForm.patchValue({
        UserCode: data.user.UserCode,
        UserName: data.user.UserName,
        department: data.user.department,
        role: data.user.role,
        userName: data.user.userName ||  '',
        password: data.user.password 
      });
    }
  }

  ngOnInit(): void {}

  submitUser(): void {
    if (this.userForm.valid) {
      // Prepare user object based on mode
      const formValue = this.userForm.value;
      let user: User;

      if (this.isEditMode) {
        user = {
          UserCode: formValue.UserCode,
          UserName: formValue.UserName,
          department: formValue.department,
          role: formValue.role,
          userName: formValue.userName,
          password: formValue.password
        };
      } else {
        user = {
          UserCode: formValue.UserCode,
          UserName: formValue.UserName,
          department: formValue.department,
          role: formValue.role,
          userName: formValue.userName,
          password: formValue.password
        };
      }

      if (this.isEditMode) {
        console.log('Dispatching updateUser with:', user);
        this.store.dispatch(updateUser({ user }));
      } else {
        console.log('Dispatching createUser with:', user);
        this.store.dispatch(createUser({ user }));
      }

      this.dialogRef.close();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  
}