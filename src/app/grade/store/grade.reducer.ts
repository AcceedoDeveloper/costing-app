import { createReducer, on } from '@ngrx/store';
import * as GradeActions from './grade.actions';
import { Grade } from '../../models/garde.model';

export interface GradeState {
  grades: Grade[];
  error: any;
}

export const initialState: GradeState = {
  grades: [],
  error: null
};

export const gradeReducer = createReducer(
  initialState,
  on(GradeActions.loadGradesSuccess, (state, { grades }) => ({ ...state, grades })),
  on(GradeActions.loadGradesFailure, (state, { error }) => ({ ...state, error })),
  on(GradeActions.deleteGradeSuccess, (state, { gradeNo }) => ({
  ...state,
  grades: state.grades.filter(g => g.gradeNo !== gradeNo),
}))

);
