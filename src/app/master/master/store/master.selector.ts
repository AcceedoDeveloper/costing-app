import { createFeatureSelector, createSelector } from '@ngrx/store';

export const USER_STATE_NAME = 'users';
const getUserState = createFeatureSelector<any>(USER_STATE_NAME);

export const getUsers = createSelector(getUserState, (state) => state.users);
export const getUserCount = createSelector(getUserState, (state) => state.count);