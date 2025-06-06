import { createReducer, on } from '@ngrx/store';
import * as GradeActions from './grade.actions';
import { Grade } from '../../models/garde.model';
import {MaterialItem} from '../../models/MaterialMap.model';


export interface GradeState {
  grades: Grade[];
   materialMap: { [key: string]: MaterialItem[] };
  error: any;
}

export const initialState: GradeState = {
  grades: [],
  materialMap: {}, 
  error: null
};

export const gradeReducer = createReducer(
  initialState,
  on(GradeActions.loadGradesSuccess, (state, { grades }) => ({ ...state, grades })),
  on(GradeActions.loadGradesFailure, (state, { error }) => ({ ...state, error })),
  on(GradeActions.deleteGradeSuccess, (state, { gradeNo }) => ({
  ...state,
  grades: state.grades.filter(g => g.gradeNo !== gradeNo),
})),

 on(GradeActions.loadMaterialMapSuccess, (state, { materialMap }) => ({
    ...state,
    materialMap
  })),
  on(GradeActions.loadMaterialMapFailure, (state, { error }) => ({
    ...state,
    error
  })),
  on(GradeActions.addGradeSuccess, (state, { response }) => ({
    ...state,
    grades: [...state.grades, response]
  })),
  on(GradeActions.addGradeFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(GradeActions.updateGradeSuccess, (state, { updatedGrade }) => ({
  ...state,
  grades: state.grades.map(grade =>
    grade._id === updatedGrade._id ? updatedGrade : grade
  )
})),
on(GradeActions.updateGradeFailure, (state, { error }) => ({
  ...state,
  error
}))



);
