import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { addSalaryEntry, updateSalaryEntry} from '../../store/material.actions'; // <-- Add update action

@Component({
  selector: 'app-add-salary-wages',
  templateUrl: './add-salary-wages.component.html',
  styleUrls: ['./add-salary-wages.component.css']
})
export class AddSalaryWagesComponent implements OnInit {
  salaryForm: FormGroup;
  isEditMode = false;
  recordId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddSalaryWagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.salaryForm = this.fb.group({
      processName: ['', Validators.required],
      salaryforProcess: [0, Validators.required],
      salaryExcludingCoreMaking: [0, Validators.required],
      salaryForCoreProduction: [0, Validators.required],
      outSourcingCost: [0, Validators.required],
      splOutSourcingCost: [0, Validators.required]
    });

    // If data is passed, populate the form for editing
    if (this.data) {
      this.isEditMode = true;
      this.salaryForm.patchValue(this.data);
       this.recordId = this.data._id;
    }
  }

 onSubmit() {
  if (this.salaryForm.valid) {
    const formData = this.salaryForm.value;
    const _id = this.recordId; // from earlier

    if (this.isEditMode) {
      this.store.dispatch(updateSalaryEntry({ id: _id, payload: formData }));
    } else {
      this.store.dispatch(addSalaryEntry({ payload: formData }));
    }

    this.dialogRef.close();
  }
}

}
