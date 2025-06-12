import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

import {Material} from '../../models/material.model';
import { loadMaterials, loadMaterialsFailure, loadMaterialsSuccess
  , deleteMaterial, deleteMaterialSuccess, createMaterial, createMaterialSuccess
  , updateMaterial, updateMaterialSuccess, updateMaterialFailure
  , loadSuppliers, loadSuppliersSuccess, loadSuppliersFailure
  , addSupplier, addSupplierSuccess, addSupplierFailure
  , deleteSupplier, deleteSupplierSuccess
  ,  updateSupplier, updateSupplierSuccess, updateSupplierFailure
  , loadCustomerDetails, loadCustomerDetailsSuccess, loadCustomerDetailsFailure
  , addProcess, addProcessFailure, addProcessSuccess
  , loadProcesses, loadProcessesSuccess, loadProcessesFailure
} from './material.actions';
import {MaterialService} from '../../services/material.service';
import {MaterialTypeService} from '../../services/material-type.service';
import { GradeService} from '../../services/grade.service';
import { ProcessService } from '../../services/process.service';
import { loadMaterialMap, loadMaterialMapSuccess, loadMaterialMapFailure } from './material.actions';

import { ToastrService } from 'ngx-toastr';

@Injectable()

export class MaterialEffects {
    constructor(private actions$: Actions, private materialService: MaterialService, private toastr: ToastrService, private gradeService: GradeService, private materialTypeService: MaterialTypeService, private processservices : ProcessService) {}


 loadMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMaterials),
      mergeMap(() =>
        this.materialService.getMaterials().pipe(
          tap(response => console.log('Materials response:', response)),
          map(response => loadMaterialsSuccess({ materials: response })), 
          catchError(error => {
            console.error('Error loading materials:', error);
            this.toastr.error('Failed to load materials.', 'Error');
            return of(loadMaterialsFailure({ error: error.message }));
          })
        )
      )
    )
  );

createMaterial$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(createMaterial),
    mergeMap((action) => {
      return this.materialService.addMaterial(action.material).pipe(
        map((material) => {
          this.toastr.success('Material created successfully!', 'Success'); // ✅ Toastr for success
          return createMaterialSuccess({ material });
        }),
        catchError((error) => {
          this.toastr.error('Failed to create material.', 'Error'); // ✅ Toastr for error
          return of({ type: '[Material] Create Material Failed' });
        })
      );
    })
  );
});


updateMaterial$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateMaterial),
    mergeMap(action =>
      this.materialService.updateMaterial(action.material).pipe(
        map(() => {
          this.toastr.success('Material updated successfully!', 'Success'); 
          return updateMaterialSuccess({ material: action.material });
        }),
        catchError(error => {
          this.toastr.error('Failed to update material.', 'Error'); 
          return of(updateMaterialFailure({ error: error.message }));
        })
      )
    )
  )
);


updateMaterialSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateMaterialSuccess),
    map(() => loadMaterials())
  )
);



 deleteMaterial$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(deleteMaterial),
    mergeMap((action) => {
      return this.materialService.deleteMaterial(action.id).pipe(
        map(() => {
          this.toastr.success('Material deleted successfully!', 'Success'); // ✅ Success toast
          return deleteMaterialSuccess({ id: action.id });
        }),
        catchError((error) => {
          this.toastr.error('Failed to delete material.', 'Error'); // ✅ Error toast
          return of({ type: '[Material] Delete Material Failed' });
        })
      );
    })
  );
});



loadMaterialMap$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadMaterialMap),
    mergeMap(() =>
      this.gradeService.getMaterialMap().pipe(
        map(response =>
          loadMaterialMapSuccess({ materialMap: response.materialMap }) // ✅ FIXED HERE
        ),
        catchError(error =>
          of(loadMaterialMapFailure({ error }))
        )
      )
    )
  )
);


loadSuppliers$ = createEffect(() =>
  this.actions$.pipe(
    ofType('[Supplier] Load Suppliers'),
    mergeMap(() =>
      this.materialService.getSuppliers().pipe(
        map(suppliers => loadSuppliersSuccess({ suppliers })),
        catchError(error => of(loadSuppliersFailure({ error: error.message })))
      )
    )
  )
);


addSupplier$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(addSupplier),
    mergeMap((action) => {
      return this.materialService.addSupplier(action.supplier).pipe(
        map((supplier) => {
          this.toastr.success('Supplier added successfully!', 'Success'); // ✅ Toastr for success
          return addSupplierSuccess({ supplier });
        }),
        catchError((error) => {
          this.toastr.error('Failed to add supplier.', 'Error'); // ✅ Toastr for error
          return of(addSupplierFailure({ error: error.message }));
        })
      );
    })
  );
});


delectSupplier$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(deleteSupplier),
    mergeMap((action) => {
      return this.materialService.deleteSupplier(action.id).pipe(
        map(() => {
          this.toastr.success('Supplier deleted successfully!', 'Success'); // ✅ Toastr for success
          return deleteSupplierSuccess({ id: action.id });
        }),
        catchError((error) => {
          this.toastr.error('Failed to delete supplier.', 'Error'); // ✅ Toastr for error
          return of({ type: '[Supplier] Delete Supplier Failed' });
        })
      );
    })
  );
});


updateSupplier$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateSupplier),
    mergeMap(action =>
      this.materialService.updateSupplier(action.supplier).pipe(
        map(() => {
          this.toastr.success('Supplier updated successfully!', 'Success');
          return updateSupplierSuccess({ supplier: action.supplier });
        }),
        catchError(error => {
          this.toastr.error('Failed to update supplier.', 'Error');
          return of(updateSupplierFailure({ error: error.message }));
        })
      )
    )
  )
);

loadCustomerDetails$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadCustomerDetails),
    mergeMap(() =>
      this.materialTypeService.getCustomerDetails().pipe(
        map(customers => loadCustomerDetailsSuccess({ customers })),
        catchError(error => of(loadCustomerDetailsFailure({ error: error.message })))
      )
    )
  )
);

loadProcesses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProcesses),
      mergeMap(() =>
        this.processservices.getProcesses().pipe(
          map(processes => loadProcessesSuccess({ processes })),
          catchError(error => of(loadProcessesFailure({ error })))
        )
      )
    )
  );

addProcess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProcess),
      mergeMap(action =>
        this.processservices.addProcess(action.process).pipe(
          map(process => addProcessSuccess({ process })),
          catchError(error => of(addProcessFailure({ error })))
        )
      )
    )
  );



}
