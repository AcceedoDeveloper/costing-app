import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  MatDialogRef} from '@angular/material/dialog';
import {addSalaryEntry } from '../../store/material.actions';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-add-salary-wages',
  templateUrl: './add-salary-wages.component.html',
  styleUrls: ['./add-salary-wages.component.css']
})
export class AddSalaryWagesComponent implements OnInit {
  salaryForm: FormGroup;
  constructor(private fb: FormBuilder,
     private dialogRef: MatDialogRef<AddSalaryWagesComponent>,
     private store : Store
  ) { }

  ngOnInit(): void {
    this.salaryForm = this.fb.group({
      processName: ['', Validators.required],
      salaryforProcess: [0, Validators.required],
      salaryExcludingCoreMaking: [0, Validators.required],
      salaryForCoreProduction: [0, Validators.required],
      outSourcingCost: [0, Validators.required],
      splOutSourcingCost: [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.salaryForm.valid) {
      const formData = this.salaryForm.value;
      console.log('Submitted Data:', formData);
      this.store.dispatch(addSalaryEntry({payload: formData}));
    } else {
      console.warn('Form is invalid');
    }
    this.dialogRef.close();
  }

}
