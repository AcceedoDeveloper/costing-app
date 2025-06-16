import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  createMaterial,
  updateMaterial,
  loadMaterials,
  loadMaterialMap,
  loadSuppliers
} from '../../store/material.actions';
import { Material } from '../../../models/material.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getMaterialMap, getSuppliers } from '../../store/material.selector';
import { Observable } from 'rxjs';
import { Supplier } from '../../../models/Supplier.model';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.css'],
})
export class AddMaterialComponent implements OnInit {
  materialForm: FormGroup;
  supplierMaterialForm: FormGroup;
  isEditMode = false;
  materialId?: string;
  materialTypeKeys: string[] = [];
  materialSource: 'inHouse' | 'supplier' = 'inHouse';

  suppliers$: Observable<Supplier[]> = new Observable<Supplier[]>();
  suppliers: Supplier[] = [];
  uniqueMaterialTypes: string[] = [];
  filteredMaterialNames: string[] = [];
  filteredSuppliers: Supplier[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    public dialogRef: MatDialogRef<AddMaterialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.materialForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      unitCost: [0, [Validators.required, Validators.min(0.01)]],
       effectiveTill: ['', Validators.required],
    });

    this.supplierMaterialForm = this.fb.group({
      materialType: ['', Validators.required],
      materialName: ['', Validators.required],
      supplierName: ['', Validators.required],
    });

    if (data && data.isEditMode) {
      this.isEditMode = true;
      this.materialId = data.material._id;
      this.materialSource = 'inHouse'; // Default to inHouse for edit
    }
  }

  ngOnInit(): void {
    // Load materials and types
    this.store.dispatch(loadMaterialMap());
    this.store.select(getMaterialMap).subscribe((materialMap) => {
      this.materialTypeKeys = Object.keys(materialMap);

      // Patch form values only after types are loaded
     if (this.isEditMode && this.data?.material) {
  this.materialForm.patchValue({
  name: this.data.material.name,
  type: this.data.material.materialType,
  unitCost: this.data.material.unitCost,
  effectiveTill: this.data.material.effectiveTill
    ? new Date(this.data.material.effectiveTill)
    : null
});

}

    });

    // Load suppliers
    this.store.dispatch(loadSuppliers());
    this.suppliers$ = this.store.pipe(select(getSuppliers));
    this.suppliers$.subscribe((suppliers) => {
      this.suppliers = suppliers;
      this.uniqueMaterialTypes = [
        ...new Set(suppliers.map((s) => s.materialType)),
      ];
    });
  }

  onMaterialSourceChange() {
    this.materialForm.reset();
    this.supplierMaterialForm.reset();
    this.filteredMaterialNames = [];
    this.filteredSuppliers = [];
  }

  onMaterialTypeChange() {
    const materialType = this.supplierMaterialForm.get('materialType')?.value;
    if (materialType) {
      this.filteredMaterialNames = [
        ...new Set(
          this.suppliers
            .filter((s) => s.materialType === materialType)
            .map((s) => s.materialName)
        ),
      ];
      this.supplierMaterialForm.get('materialName')?.reset();
      this.supplierMaterialForm.get('supplierName')?.reset();
      this.filteredSuppliers = [];
    }
  }

  onMaterialNameChange() {
    const materialType = this.supplierMaterialForm.get('materialType')?.value;
    const materialName = this.supplierMaterialForm.get('materialName')?.value;
    if (materialType && materialName) {
      this.filteredSuppliers = this.suppliers.filter(
        (s) => s.materialType === materialType && s.materialName === materialName
      );
      this.supplierMaterialForm.get('supplierName')?.reset();
    }
  }

  submitMaterial(): void {
    if (this.materialForm.valid) {
      const formValue = this.materialForm.value;
      const material: Material = {
        name: formValue.name,
        materialType: formValue.type,
        houseType: 'in-house',
        unitCost: formValue.unitCost,
        effectiveTill: this.formatDateToLocal(formValue.effectiveTill),
        _id: this.materialId,
      };

      if (this.isEditMode && this.materialId) {
        console.log('data', material);
        this.store.dispatch(updateMaterial({ material }));
      } else {
        console.log('data', material);
        this.store.dispatch(createMaterial({ material }));
        this.store.dispatch(loadMaterials());
      }

      this.store.dispatch(loadMaterialMap());
      this.dialogRef.close();
    }
  }

 submitSupplierMaterial(): void {
  if (this.supplierMaterialForm.valid) {
    const { materialType, materialName, supplierName } =
      this.supplierMaterialForm.value;

    const selectedSupplier = this.suppliers.find(
      (s) =>
        s.materialType === materialType &&
        s.materialName === materialName &&
        s.name === supplierName
    );

    if (selectedSupplier) {
      const material: Material = {
        name: selectedSupplier.materialName,
        materialType: selectedSupplier.materialType,
        unitCost: Number(selectedSupplier.ratePerKg),
        houseType: 'supplier',
        _id: selectedSupplier._id,
      };

      if (this.isEditMode && this.materialId) {
        this.store.dispatch(updateMaterial({ material }));
      } else {
        this.store.dispatch(createMaterial({ material }));
        this.store.dispatch(loadMaterials());
      }

      this.store.dispatch(loadMaterialMap());
      this.dialogRef.close();
    }
  }
}

formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}



  cancel(): void {
    this.dialogRef.close();
  }
}
