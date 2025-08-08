import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
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
     
      type: this.fb.array([]),

      grade: [''],
      materials: this.fb.array([])
    });

    this.store.dispatch(GradeActions.loadGrades());
    this.store.dispatch(GradeActions.loadMaterialMap());

    this.grades$ = this.store.select(fromGrade.selectAllGrades);

    this.store.select(fromGrade.selectMaterialMap).subscribe(materialMap => {
      this.materialMap = materialMap;
      this.materialTypes = Object.keys(materialMap);
    });
  }

  get materials(): FormArray {
    return this.processForm.get('materials') as FormArray;
  }

  isChecked(type: string): boolean {
    return (this.processForm.get('type') as FormArray).value.includes(type);
  }

  onExclusiveCheckboxChange(selectedType: string, isChecked: boolean): void {
    const typeArray: FormArray = this.processForm.get('type') as FormArray;

    // Remove all current selections
    while (typeArray.length !== 0) {
      typeArray.removeAt(0);
    }

    // Add new selection
    if (isChecked) {
      typeArray.push(new FormControl(selectedType));
    }

    const gradeCtrl = this.processForm.get('grade');
    const materialsCtrl = this.processForm.get('materials');

    if (selectedType === 'grade') {
      gradeCtrl?.setValidators(Validators.required);
      if (materialsCtrl instanceof FormArray) {
        while (materialsCtrl.length > 0) {
          materialsCtrl.removeAt(0);
        }
      }
    } else {
      gradeCtrl?.clearValidators();
      gradeCtrl?.setValue('');
      if (materialsCtrl instanceof FormArray && materialsCtrl.length === 0) {
        this.addMaterial();
      }
    }

    gradeCtrl?.updateValueAndValidity();
  }

  createMaterialGroup(): FormGroup {
    return this.fb.group({
      selectedType: [null, Validators.required],
      selectedName: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
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

    const selectedType = formValue.type[0]; // can be undefined
    let payload: any = {
      processName: formValue.processName,
      rawMaterial: [],
      grade: ''
    };

    if (selectedType === 'grade') {
      payload.grade = formValue.grade;
    } else if (selectedType === 'material') {
      payload.rawMaterial = formValue.materials.map((material: any) => ({
        type: material.selectedType,
        materialsUsed: [
          {
            name: material.selectedName,
            quantity: material.quantity
          }
        ]
      }));
    }

    console.log('data', payload);

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
