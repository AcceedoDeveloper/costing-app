import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GradeService } from '../../services/grade.service';
import * as GradeActions from './grade.actions';
import { catchError, map, mergeMap,  } from 'rxjs/operators';
import { of} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs/operators';


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
            GradeActions.loadMaterialMapSuccess({ materialMap: response.materialMap })
          ),
          tap(action => console.log('Material Map Data:', action.materialMap)), // Log the materialMap data
          catchError(error =>
            of(GradeActions.loadMaterialMapFailure({ error })).pipe(
              tap(() => console.log('Error loading material map:', error)) // Optional: Log errors as well
            )
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

  updateGrade$ = createEffect(() =>
  this.actions$.pipe(
    ofType(GradeActions.updateGrade),
    mergeMap(action =>
      this.gradeService.updateGrade(action.id, action.grade).pipe(
        map(updatedGrade => {
          this.toastr.success('Grade updated successfully!', 'Success');
          return GradeActions.updateGradeSuccess({ updatedGrade });
        }),
        catchError(error => {
          this.toastr.error('Failed to update grade.', 'Error');
          return of(GradeActions.updateGradeFailure({ error }));
        })
      )
    )
  )
);


}