import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addSupplier,  } from '../../store/material.actions';
import { Supplier } from '../../../models/Supplier.model';
import{ updateSupplier } from '../../store/material.actions';
import { getMaterialMap } from '../../store/material.selector';
import { loadMaterialMap } from '../../store/material.actions';


@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {

  materialTypeKeys: string[] = [];
  supplierForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Supplier | null,
    private fb: FormBuilder,
    private store: Store
  ) {
    this.supplierForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      materialType: ['', Validators.required],
      materialName: ['', Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      ratePerKg: ['', Validators.required],
      effectiveTill: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadMaterialMap());

  // Get keys from materialMap
  this.store.select(getMaterialMap).subscribe((materialMap) => {
    this.materialTypeKeys = Object.keys(materialMap);
  });
    if (this.data) {
      this.isEditMode = true;
      console.log('data', this.data);
      this.supplierForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      const formData = { ...this.supplierForm.value };

      if (formData.effectiveTill instanceof Date) {
        const date = formData.effectiveTill;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formData.effectiveTill = `${year}-${month}-${day}`;
      }

      if (this.isEditMode) {
        console.log('Updating supplier:', formData);
        formData.id = this.data?._id; // Ensure the ID is set for update
        console.log('Supplier ID:', formData.id);
        // When dispatching the update
        this.store.dispatch(updateSupplier({ supplier: formData }));

      } else {
        this.store.dispatch(addSupplier({ supplier: formData }));
      }

      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
