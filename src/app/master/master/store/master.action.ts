import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/users.model';

export const CREATE_USER = '[user page] create user';
export const CREATE_USER_SUCCESS = '[user page] create user success';

export const createUser = createAction(CREATE_USER, props<{ user: User }>());
export const createUserSuccess = createAction(CREATE_USER_SUCCESS, props<{ user: User }>());