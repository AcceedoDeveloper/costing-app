import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { createMaterial, updateMaterial} from '../../store/material.actions';
import { Material } from '../../../models/material.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-add-material',
  templateUrl: './add-material.component.html',
  styleUrls: ['./add-material.component.css'],
})
export class AddMaterialComponent implements OnInit {
  materialForm: FormGroup;
  isEditMode = false;
  materialId?: string;

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
    });

    if (data && data.isEditMode) {
    this.isEditMode = true;
    this.materialId = data.material._id; 
    this.materialForm.patchValue(data.material); 
  }
  }

  ngOnInit(): void {
    
  }

 submitMaterial(): void {
  if (this.materialForm.valid) {
    const material: Material = { ...this.materialForm.value, _id: this.materialId }; 
    console.log('data', material);

    if (this.isEditMode && this.materialId) {
      this.store.dispatch(updateMaterial({ material }));  
    } else {
      this.store.dispatch(createMaterial({ material }));
    }

    this.dialogRef.close();  
  }
}

 cancel(): void {
    this.dialogRef.close();
  }

  
}