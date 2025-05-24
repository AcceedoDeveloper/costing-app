import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GradeService } from '../../services/grade.service';
import * as GradeActions from './grade.actions';
import { catchError, map, mergeMap,  } from 'rxjs/operators';
import { of} from 'rxjs';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class GradeEffects {
  constructor(private actions$: Actions, private gradeService: GradeService, private toastr: ToastrService) {}

  loadGrades$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.loadGrades),
      mergeMap(() =>
        this.gradeService.getAll().pipe(
          map(grades => GradeActions.loadGradesSuccess({ grades })),
          catchError(error => of(GradeActions.loadGradesFailure({ error })))
        )
      )
    )
  );

 deleteGrade$ = createEffect(() =>
  this.actions$.pipe(
    ofType(GradeActions.deleteGrade),
    mergeMap(action =>
      this.gradeService.deleteGrade(action.gradeNo).pipe(
        map(() => {
          this.toastr.success('Grade deleted successfully!', 'Success'); // ✅ success toast
          return GradeActions.deleteGradeSuccess({ gradeNo: action.gradeNo });
        }),
        catchError(error => {
          this.toastr.error('Failed to delete grade.', 'Error'); // ✅ error toast
          return of(GradeActions.deleteGradeFailure({ error }));
        })
      )
    )
  )
);

loadMaterialMap$ = createEffect(() =>
  this.actions$.pipe(
    ofType(GradeActions.loadMaterialMap),
    mergeMap(() =>
      this.gradeService.getMaterialMap().pipe(
        map(response =>
          GradeActions.loadMaterialMapSuccess({ materialMap: response.materialMap }) // ✅ FIXED HERE
        ),
        catchError(error =>
          of(GradeActions.loadMaterialMapFailure({ error }))
        )
      )
    )
  )
);


  addGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.addGrade),
      mergeMap(action =>
        this.gradeService.addGrade(action.grade).pipe(
          map(response => {
            this.toastr.success('Grade added successfully!', 'Success'); // ✅ success toast
            return GradeActions.addGradeSuccess({ response });
          }),
          catchError(error => {
            this.toastr.error('Failed to add grade.', 'Error'); // ✅ error toast
            return of(GradeActions.addGradeFailure({ error }));
          })
        )
      )
    )
  );

}