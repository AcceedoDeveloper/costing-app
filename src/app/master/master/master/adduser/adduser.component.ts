import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { createUser } from '../../store/master.action';
import { getUsers, getUserCount } from '../../store/master.selector';
import { User } from '../../../../models/users.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
  users$: Observable<User[]>;
  count$: Observable<number>;
  userForm: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.users$ = this.store.select(getUsers);
    this.count$ = this.store.select(getUserCount);

   this.userForm = this.fb.group({
  UserCode: ['', Validators.required],
  UserName: ['', Validators.required],
  department: ['', Validators.required],
  role: ['', Validators.required],
  password: ['', Validators.required]
});

  }

  ngOnInit(): void {
   
  }

  createNewUser(): void {
  if (this.userForm.valid) {
    const newUser: User = this.userForm.value;
    console.log('Dispatching createUser with:', newUser);
    this.store.dispatch(createUser({ user: newUser }));
    this.userForm.reset();
  }
}

}