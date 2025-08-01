import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { updateProcess } from '../../store/material.actions';
import { Observable } from 'rxjs';
import * as GradeActions from '../../../grade/store/grade.actions';
import * as fromGrade from '../../../grade/store/grade.selectors';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-processedit',
  templateUrl: './processedit.component.html',
  styleUrls: ['./processedit.component.css']
})
export class ProcesseditComponent implements OnInit {
  grades$!: Observable<any[]>;
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
  this.store.dispatch(GradeActions.loadMaterialMap());
  this.store.dispatch(GradeActions.loadGrades());

  this.materialMap$.subscribe(materialMap => {
    this.materialMap = materialMap;
    this.materialTypes = Object.keys(materialMap);
  });

  this.grades$ = this.store.select(fromGrade.selectAllGrades);

  // Initialize the form structure once
  this.form = this.fb.group({
    materialFormArray: this.fb.array([]),
    grade: this.fb.group({
      _id: [this.data.grade?.[0]?._id || '']
    })
  });

  // Set the local reference to the form array
  this.materialFormArray = this.form.get('materialFormArray') as FormArray;

  // Always clear first, then populate (to avoid duplicates)
  this.materialFormArray.clear();
  this.initForm(this.data.rawMaterial);
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

    const selectedGradeId = this.form.get('grade._id')?.value;

    this.grades$.pipe(take(1)).subscribe(grades => {
      const selectedGrade = grades.find(g => g._id === selectedGradeId);
      const gradeName = selectedGrade?.name || '';

      const updatedProcess = {
        processName: this.data.processName,
        rawMaterial: reconstructedRawMaterial,
        grade: gradeName,
      };

      console.log('data', updatedProcess);
      this.store.dispatch(updateProcess({ id: this.data._id, process: updatedProcess }));
      this.dialogRef.close();
    });
  } else {
    this.form.markAllAsTouched();
  }
}






  cancel(): void {
    this.dialogRef.close();
  }


  addMaterial(): void {
  const group = this.fb.group({
    type: ['', Validators.required],
    name: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]]
  });

  this.materialFormArray.push(group);
}

removeMaterial(index: number): void {
  this.materialFormArray.removeAt(index);
}

onTypeChange(index: number): void {
  const control = this.materialFormArray.at(index);
  control.get('name')?.reset(); // Reset name field if type changes
}

// Get material names based on selected type
getMaterialsForType(type: string): any[] {
  return this.materialMap[type] || [];
}

}
