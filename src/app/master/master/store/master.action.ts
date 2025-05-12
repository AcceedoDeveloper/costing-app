import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/users.model';

export const CREATE_USER = '[user page] create user';
export const CREATE_USER_SUCCESS = '[user page] create user success';
export const LOAD_USERS = '[user page] load users';
export const LOAD_USERS_SUCCESS = '[user page] load users success';
export const LOAD_USERS_FAILURE = '[user page] load users failure';

export const createUser = createAction(CREATE_USER, props<{ user: User }>());
export const createUserSuccess = createAction(CREATE_USER_SUCCESS, props<{ user: User }>());

export const loadUsers = createAction(LOAD_USERS);
export const loadUsersSuccess = createAction(LOAD_USERS_SUCCESS, props<{ users: User[] }>());
export const loadUsersFailure = createAction(LOAD_USERS_FAILURE, props<{ error: string }>());
