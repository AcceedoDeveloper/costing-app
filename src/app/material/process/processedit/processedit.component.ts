import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { updateProcess } from '../../store/material.actions';
import { Observable } from 'rxjs';
import * as GradeActions from '../../../grade/store/grade.actions';
import * as fromGrade from '../../../grade/store/grade.selectors';


@Component({
  selector: 'app-processedit',
  templateUrl: './processedit.component.html',
  styleUrls: ['./processedit.component.css']
})
export class ProcesseditComponent implements OnInit {
  materialMap$!: Observable<{ [key: string]: any[] }>;
  materialMap: { [key: string]: any[] } = {};
  materialTypes: string[] = [];
  form: FormGroup;
  materialFormArray: FormArray;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProcesseditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store : Store
  ) {
    this.materialMap$ = this.store.select(fromGrade.selectMaterialMap);
    this.materialFormArray = this.fb.array([]);
    this.form = this.fb.group({
      materialFormArray: this.materialFormArray
    });
  }

  ngOnInit(): void {
  const rawMaterialCopy = this.data.rawMaterial.map(raw => ({
    ...raw,
    materialsUsed: raw.materialsUsed.map(material => ({ ...material }))
  }));

  this.initForm(rawMaterialCopy);
  this.store.dispatch(GradeActions.loadMaterialMap());

    // Subscribe to materialMap to update local variables
    this.materialMap$.subscribe(materialMap => {
      this.materialMap = materialMap;
      this.materialTypes = Object.keys(materialMap);
      console.log('Material Map:', this.materialMap);
      console.log('Material Types:', this.materialTypes);
    });
}


  initForm(rawMaterial: any[]): void {
    rawMaterial.forEach(raw => {
      raw.materialsUsed.forEach((mat: any) => {
        this.materialFormArray.push(
          this.fb.group({
            type: [raw.type],
            name: [mat.name],
            quantity: [mat.quantity, [Validators.required, Validators.min(1)]]
          })
        );
      });
    });
  }

save(): void {
  if (this.form.valid) {
    const flatMaterials = this.materialFormArray.value;

    const rawMaterialMap: { [type: string]: any[] } = {};

    flatMaterials.forEach(mat => {
      if (!rawMaterialMap[mat.type]) {
        rawMaterialMap[mat.type] = [];
      }
      rawMaterialMap[mat.type].push({ name: mat.name, quantity: mat.quantity });
    });

    const reconstructedRawMaterial = Object.entries(rawMaterialMap).map(([type, materialsUsed]) => ({
      type,
      materialsUsed
    }));

    const gradeName = Array.isArray(this.data.grade) ? this.data.grade[0]?.name : this.data.grade;

    const updatedProcess = {
      processName: this.data.processName,
      rawMaterial: reconstructedRawMaterial,
      grade: gradeName || ''
    };

    console.log('data', updatedProcess);
    this.store.dispatch(updateProcess({ id: this.data._id, process: updatedProcess }));

    this.dialogRef.close();
  } else {
    this.form.markAllAsTouched();
  }
}





  cancel(): void {
    this.dialogRef.close();
  }
}
