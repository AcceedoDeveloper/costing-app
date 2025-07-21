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
  , loadMaterialTypes, loadMaterialTypesFailure, loadMaterialTypesSuccess
  , addMaterialType, addMaterialTypeFailure, addMaterialTypeSuccess
  , updateMaterialType, updateMaterialTypeFailure, updateMaterialTypeSuccess
  , deleteMaterialType, deleteMaterialTypeFailure, deleteMaterialTypeSuccess
  , deleteProcess, deleteProcessFailure, deleteProcessSuccess
  , updateProcess , updateProcessFailure, updateProcessSuccess
  , addCustomerDetails, addCustomerDetailsFailure, addCustomerDetailsSuccess
  ,updateCustomerDetails, updateCustomerDetailsFailure, updateCustomerDetailsSuccess
  , deleteCustomer, deleteCustomerFailure, deleteCustomerSuccess
  , loadPowerCosts, loadPowerCostsSuccess, loadPowerCostsFailure
  , addPowerCost, addPowerCostFailure, addPowerCostSuccess
  , updatePowerCost, updatePowerCostSuccess
  , loadSalaryMap, loadSalaryMapSuccess, loadSalaryMapFailure
  , addSalaryEntry, addSalaryEntryFailure, addSalaryEntrySuccess
  , updateSalaryEntry, updateSalaryEntryFailure, updateSalaryEntrySuccess
} from './material.actions';
import {MaterialService} from '../../services/material.service';
import {MaterialTypeService} from '../../services/material-type.service';
import { GradeService} from '../../services/grade.service';
import { ProcessService } from '../../services/process.service';
import { loadMaterialMap, loadMaterialMapSuccess, loadMaterialMapFailure } from './material.actions';
import { CustomerProcess } from '../../models/Customer-details.model';
import { ToastrService } from 'ngx-toastr';
import { PowerService} from '../../services/power.service';


@Injectable()

export class MaterialEffects {
    constructor(private actions$: Actions, 
      private materialService: MaterialService, 
      private toastr: ToastrService, 
      private gradeService: GradeService, 
      private materialTypeService: MaterialTypeService, 
      private processservices : ProcessService,
      private powerservices : PowerService) {}


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
        tap(() => this.toastr.success('Process added successfully!', 'Success')),
        mergeMap(() => [
          loadProcesses()
        ]),
        catchError(error => {
          this.toastr.error('Failed to add process.', 'Error');
          return of(addProcessFailure({ error }));
        })
      )
    )
  )
);



updateProcess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateProcess),
    mergeMap(action =>
      this.processservices.updateProcess(action.id, action.process).pipe(
        tap(() => this.toastr.success('Process updated successfully!', 'Success')),
        mergeMap(() => [
          loadProcesses()
        ]),
        catchError(error => {
          this.toastr.error('Failed to update process.', 'Error');
          return of(updateProcessFailure({ error }));
        })
      )
    )
  )
);





 deleteProcess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(deleteProcess),
    mergeMap(action =>
      this.processservices.deleteProcess(action.id).pipe(
        tap(() => this.toastr.success('Process deleted successfully!', 'Success')),
        map(() => deleteProcessSuccess({ id: action.id })),
        catchError(error => {
          this.toastr.error('Failed to delete process.', 'Error');
          return of(deleteProcessFailure({ error }));
        })
      )
    )
  )
);



  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMaterialTypes),
      mergeMap(() =>
        this.materialTypeService.getMaterialTypes().pipe(
          map(materialTypes => loadMaterialTypesSuccess({ materialTypes })),
          catchError(error => of(loadMaterialTypesFailure({ error })))
        )
      )
    )
  );

    add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addMaterialType),
      mergeMap(({ material }) =>
        this.materialTypeService.addMaterialType(material).pipe(
          map(material => {
            this.toastr.success('Material type added successfully!', 'Success');
            return addMaterialTypeSuccess({ material });
          }),
          catchError(error => {
            this.toastr.error('Failed to add material type.', 'Error');
            return of(addMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateMaterialType),
      mergeMap(({ id, material }) =>
        this.materialTypeService.updateMaterialType(id, material).pipe(
          map(updated => {
            this.toastr.success('Material type updated successfully!', 'Success');
            return updateMaterialTypeSuccess({ material: updated });
          }),
          catchError(error => {
            this.toastr.error('Failed to update material type.', 'Error');
            return of(updateMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteMaterialType),
      mergeMap(({ id }) =>
        this.materialTypeService.deleteMaterialType(id).pipe(
          map(() => {
            this.toastr.success('Material type deleted successfully!', 'Success');
            return deleteMaterialTypeSuccess({ id });
          }),
          catchError(error => {
            this.toastr.error('Failed to delete material type.', 'Error');
            return of(deleteMaterialTypeFailure({ error: error.message }));
          })
        )
      )
    )
  );


// effects.ts
addCustomerDetails$ = createEffect(() =>
  this.actions$.pipe(
    ofType(addCustomerDetails),
    mergeMap(action =>
      this.materialTypeService.addCustomerDetails(action.customer).pipe(
        map(customer => addCustomerDetailsSuccess({ customer })),
        catchError(error => of(addCustomerDetailsFailure({ error })))
      )
    )
  )
);



updateCustomerDetails$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateCustomerDetails),
    mergeMap(action =>
      this.materialTypeService.updateCustomerDetails(action.id, action.customer).pipe(
        map((updatedCustomer: CustomerProcess) => {
          this.toastr.success('Customer updated successfully', 'Success');
          return updateCustomerDetailsSuccess({ customer: updatedCustomer });
        }),
        catchError(error => {
          this.toastr.error('Failed to update customer', 'Error');
          return of(updateCustomerDetailsFailure({ error: error.message }));
        })
      )
    )
  )
);


loadCustomerDetailsIN$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadCustomerDetails),
    mergeMap(() =>
      this.materialTypeService.getCustomerDetails().pipe(
        map(customers => loadCustomerDetailsSuccess({ customers })),
        catchError(error =>
          of(loadCustomerDetailsFailure({ error: error.message }))
        )
      )
    )
  )
);

deleteCustomer$ = createEffect(() =>
  this.actions$.pipe(
    ofType(deleteCustomer),
    mergeMap((action) =>
      this.materialTypeService.delectCustomerDetails(action.id).pipe(
        map(() => deleteCustomerSuccess({ id: action.id })),
        catchError((error) => of(deleteCustomerFailure({ error })))
      )
    )
  )
);


loadPowerCosts$ = createEffect(() =>
  this.actions$.pipe(
    tap(), // Log everything
    ofType(loadPowerCosts),
    tap(),
    mergeMap(() =>
      this.powerservices.getPowerCostMap().pipe(
        tap(data =>console.log(data)
        ),
        map(data => loadPowerCostsSuccess({ data })),
        catchError(error =>
          of(loadPowerCostsFailure({ error: error.message }))
        )
      )
    )
  )
);


addPowerCost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPowerCost),
      mergeMap(action =>
        this.powerservices.addPowerCost(action.processData).pipe(
          map(() => addPowerCostSuccess({ message: 'Power cost added successfully' })),
          catchError(error => of(addPowerCostFailure({ error })))
        )
      )
    )
  );

updatePowerCost$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updatePowerCost),
    mergeMap(({ id, updatedData }) =>
      this.powerservices.uupdatePowerCost(id, updatedData).pipe(
        map((res: any) => {
          this.toastr.success('Power cost updated successfully', 'Success');
          return updatePowerCostSuccess({ updatedData: res });
        }),
        catchError(error => {
          this.toastr.error('Failed to update power cost', 'Error');
          return of({ type: '[Power Cost] Update Failed', error });
        })
      )
    )
  )
);



loadSalaryMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSalaryMap),
      mergeMap(() =>
        this.powerservices.getSalaryMap().pipe(
          map((salaryMap) =>
            loadSalaryMapSuccess({ salaryMap })
          ),
          catchError((error) =>
            of(loadSalaryMapFailure({ error }))
          )
        )
      )
    )
  );

  addSalaryEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSalaryEntry),
      mergeMap(action =>
        this.powerservices.adddSlaryProcess(action.payload).pipe(
          map(response => addSalaryEntrySuccess({ response })),
          catchError(error => of(addSalaryEntryFailure({ error })))
        )
      )
    )
  );


  updateSalaryEntry$ = createEffect(() =>
  this.actions$.pipe(
    ofType(updateSalaryEntry),
    mergeMap(action =>
      this.powerservices.updateSalaryProcess(action.id, action.payload).pipe(
        map(response => updateSalaryEntrySuccess({ response })),
        catchError(error => of(updateSalaryEntryFailure({ error })))
      )
    )
  )
);


}
