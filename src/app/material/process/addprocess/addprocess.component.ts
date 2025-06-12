import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as GradeActions from '../../../grade/store/grade.actions';
import * as fromGrade from '../../../grade/store/grade.selectors';
import { Grade } from '../../../models/garde.model';
import { addProcess } from '../../store/material.actions';

@Component({
  selector: 'app-addprocess',
  templateUrl: './addprocess.component.html',
  styleUrls: ['./addprocess.component.css']
})
export class AddprocessComponent implements OnInit {
  processForm!: FormGroup;
  grades$!: Observable<Grade[]>;

  materialMap: { [key: string]: any[] } = {};
  materialTypes: string[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddprocessComponent>,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.processForm = this.fb.group({
      processName: ['', Validators.required],
      type: this.fb.array([], Validators.required),
      grade: [''],
      materials: this.fb.array([])
    });

    // Load grades and material map from store
    this.store.dispatch(GradeActions.loadGrades());
    this.store.dispatch(GradeActions.loadMaterialMap());

    this.grades$ = this.store.select(fromGrade.selectAllGrades);

    this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      this.materialTypes = Object.keys(materialMap);
    });

    // Update validations based on checkbox selection
    this.processForm.get('type')?.valueChanges.subscribe((values: string[]) => {
      const gradeCtrl = this.processForm.get('grade');
      const materialsCtrl = this.processForm.get('materials');

      if (values.includes('grade')) {
        gradeCtrl?.setValidators(Validators.required);
      } else {
        gradeCtrl?.clearValidators();
      }

      if (values.includes('material') && this.materials.length === 0) {
        this.addMaterial();
      } else if (!values.includes('material')) {
        while (this.materials.length !== 0) {
          this.materials.removeAt(0);
        }
      }

      gradeCtrl?.updateValueAndValidity();
    });
  }

  get materials(): FormArray {
    return this.processForm.get('materials') as FormArray;
  }

  onCheckboxChange(event: any): void {
    const typeArray: FormArray = this.processForm.get('type') as FormArray;

    if (event.checked) {
      typeArray.push(new FormControl(event.source.value));
    } else {
      const index = typeArray.controls.findIndex(
        x => x.value === event.source.value
      );
      if (index !== -1) {
        typeArray.removeAt(index);
      }
    }
  }

  createMaterialGroup(): FormGroup {
    return this.fb.group({
      selectedType: [null, Validators.required],
      selectedName: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]],
      filteredNames: [[]]
    });
  }

  addMaterial(): void {
    this.materials.push(this.createMaterialGroup());
  }

  onTypeChange(index: number, selectedType: string): void {
    const materialGroup = this.materials.at(index) as FormGroup;
    const filtered = this.materialMap[selectedType] || [];

    materialGroup.patchValue({
      selectedName: null,
      quantity: null,
      filteredNames: filtered
    });
  }

onSubmit(): void {
  if (this.processForm.valid) {
    const formValue = this.processForm.value;

    const payload = {
      processName: formValue.processName,
      grade: formValue.grade,
      rawMaterial: formValue.materials.map((material: any) => ({
        type: material.selectedType,
        materialsUsed: [
          {
            name: material.selectedName,
            quantity: material.quantity
          }
        ]
      }))
    };

    this.store.dispatch(addProcess({ process: payload }));
    this.dialogRef.close();
  } else {
    this.processForm.markAllAsTouched();
  }
}

  onCancel(): void {
    this.dialogRef.close();
  }
}
