import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GradeState } from './grade.reducer';

export const selectGradeState = createFeatureSelector<GradeState>('grades');
export const selectAllGrades = createSelector(selectGradeState, state => state.grades);
export const selectGradeError = createSelector(selectGradeState, state => state.error);