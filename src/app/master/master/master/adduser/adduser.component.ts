import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { createUser, updateUser } from '../../store/master.action';
import { getUsers, getUserCount } from '../../store/master.selector';
import { User } from '../../../../models/users.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { loadRoles, loadUsers } from '../../store/master.action';
import { selectAllbaseRoles } from '../../store/master.selector';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
  roles$: Observable<string[]>;
  users$: Observable<User[]>;
  count$: Observable<number>;
  userForm: FormGroup;
  isEditMode: boolean = false;
  editUserId: string | undefined = undefined; // Changed from string | null to string | undefined

  constructor(
    private store: Store,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AdduserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {

    this.store.dispatch(loadRoles());
    this.roles$ = this.store.select(selectAllbaseRoles);
  
    this.users$ = this.store.select(getUsers);
    this.count$ = this.store.select(getUserCount);

    this.userForm = this.fb.group({
      UserCode: ['', this.data?.user ? [] : [Validators.required]],
      UserName: ['', Validators.required],
      department: ['', Validators.required],
      role: ['', Validators.required],
      userName: [''],
      password: ['']
    });

    if (data?.user) {
      this.isEditMode = true;
      this.editUserId = data.user._id; // This is fine since _id is string | undefined

      this.userForm.patchValue({
        UserCode: data.user.UserCode,
        UserName: data.user.UserName,
        department: data.user.department,
        role: typeof data.user.role === 'string' ? data.user.role : data.user.role?.name,
        userName: data.user.userName || '',
        password: '',
      });
    }
  }

  ngOnInit(): void {}

  submitUser(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      let user: User;

      if (this.isEditMode && this.editUserId) {
        user = {
          _id: this.editUserId,
          UserCode: formValue.UserCode,
          UserName: formValue.UserName,
          department: formValue.department,
          role: formValue.role,
          userName: formValue.userName,
          password: formValue.password || this.data.user?.password,
        };
        console.log('Dispatching updateUser with:', user);
        this.store.dispatch(updateUser({ user }));
        this.store.dispatch(loadUsers());
      } else {
        user = {
          UserCode: formValue.UserCode,
          UserName: formValue.UserName,
          department: formValue.department,
          role: formValue.role,
          userName: formValue.userName,
          password: formValue.password,
        };
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