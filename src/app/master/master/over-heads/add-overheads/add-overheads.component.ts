import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {addOverhead } from '../../store/master.action';
import { Store } from '@ngrx/store'; 

@Component({
  selector: 'app-add-overheads',
  templateUrl: './add-overheads.component.html',
  styleUrls: ['./add-overheads.component.css']
})
export class AddOverheadsComponent implements OnInit {

  overheadForm!: FormGroup;

  constructor(private fb: FormBuilder, private store : Store) {}

  ngOnInit(): void {
    this.overheadForm = this.fb.group({
      processName: ['', Validators.required],
      repairAndMaintenance: [0, Validators.required],
      sellingDistributionAndMiscOverHeads: [0, Validators.required],
      financeCost: [0, Validators.required]
    });
  }

  onSubmit() {
    if (this.overheadForm.valid) {
      console.log(this.overheadForm.value); // ✅ Console log the form data
     const overheadData = this.overheadForm.value;
    this.store.dispatch(addOverhead({ overhead: overheadData }))
    } else {
      console.log('Form is invalid');
    }
  }
}
