import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-overheads',
  templateUrl: './add-overheads.component.html',
  styleUrls: ['./add-overheads.component.css']
})
export class AddOverheadsComponent implements OnInit {

  overheadForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

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
    } else {
      console.log('Form is invalid');
    }
  }
}
