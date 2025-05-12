import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/users.model';

export const CREATE_USER = '[user page] create user';
export const CREATE_USER_SUCCESS = '[user page] create user success';

export const LOAD_USERS = '[user page] load users';
export const LOAD_USERS_SUCCESS = '[user page] load users success';
export const LOAD_USERS_FAILURE = '[user page] load users failure';

export const UPDATE_USER = '[user page] update user';
export const UPDATE_USER_SUCCESS = '[user page] update user success';
export const UPDATE_USER_FAILURE = '[user page] update user failure';

export const DELETE_USER = '[user page] delete user';
export const DELETE_USER_SUCCESS = '[user page] delete user success';
export const DELETE_USER_FAILURE = '[user page] delete user failure';

export const createUser = createAction(CREATE_USER, props<{ user: User }>());
export const createUserSuccess = createAction(CREATE_USER_SUCCESS, props<{ user: User }>());

export const loadUsers = createAction(LOAD_USERS);
export const loadUsersSuccess = createAction(LOAD_USERS_SUCCESS, props<{ users: User[] }>());
export const loadUsersFailure = createAction(LOAD_USERS_FAILURE, props<{ error: string }>());

export const updateUser = createAction(UPDATE_USER, props<{ user: User }>());
export const updateUserSuccess = createAction(UPDATE_USER_SUCCESS, props<{ user: User }>());
export const updateUserFailure = createAction(UPDATE_USER_FAILURE, props<{ error: string }>());

export const deleteUser = createAction(DELETE_USER, props<{ id: string }>());
export const deleteUserSuccess = createAction(DELETE_USER_SUCCESS, props<{ id: string }>());
export const deleteUserFailure = createAction(DELETE_USER_FAILURE, props<{ error: string }>());
