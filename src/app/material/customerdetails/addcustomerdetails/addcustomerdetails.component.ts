import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action';
import { loadProcesses} from '../../store/material.actions';
import { getAllProcesses} from '../../store/material.selector';
import { selectCustomers } from '../../../master/master/store/master.selector';
import {loadCastingInputs } from '../../../modules/materialinput/store/casting.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { addCustomerDetails} from '../../store/material.actions';
import { CastingInput } from '../../../models/casting-input.model';
import { ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {Process } from '../../../models/process.model';
import { selectCastingInputs } from '../../../modules/materialinput/store/casting.selectors';
@Component({
  selector: 'app-addcustomerdetails',
  templateUrl: './addcustomerdetails.component.html',
  styleUrls: ['./addcustomerdetails.component.css']
})
export class AddcustomerdetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];
  processes: Process[] =[];
  castingData: CastingInput[] = [];
  expandedProcessIndex: number | null = null;
  

  @ViewChild('stepper') stepper!: MatStepper;

  thirdFormGroup!: FormGroup;


  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  forthFormGroup!: FormGroup;


  constructor(private store: Store, private fb: FormBuilder, private dialog: MatDialog) {} 

 ngOnInit(): void {
    this.store.dispatch(loadCustomers());
    this.store.dispatch(loadProcesses());
    this.store.dispatch(loadCastingInputs());



    this.customer$ = this.store.select(selectCustomers);
    this.customer$.subscribe(customer => {
      this.customer = customer;
      console.log(customer);
    });

     this.store.select(getAllProcesses).subscribe((data: Process[]) => {
      console.log(data);
      this.processes = data;
    });



this.secondFormGroup = this.fb.group({
  castingWeight: ['', Validators.required],
  cavities: ['', Validators.required],
  pouringWeight: ['', Validators.required],
  goodCastingWeight: ['', Validators.required],
  yield: ['', Validators.required],
  materialReturned: ['', Validators.required],
  yieldPercentage: ['', Validators.required]
});


this.secondFormGroup.valueChanges.subscribe(values => {
  const castingWeight = parseFloat(values.castingWeight) || 0;
  const cavities = parseFloat(values.cavities) || 0;
  const pouringWeight = parseFloat(values.pouringWeight) || 0;

  if (castingWeight && cavities && pouringWeight) {
    // Perform calculations
    const yieldPercentage = (castingWeight * cavities) / pouringWeight;
    const goodCastingWeight = Math.round(yieldPercentage * 1050);
    const yieldVal = (goodCastingWeight / 1050) * 100;
    const materialReturned = 1050 - goodCastingWeight;

    // Update the form
    this.secondFormGroup.patchValue({
      goodCastingWeight: goodCastingWeight,
      yield: yieldVal.toFixed(2),
      materialReturned: materialReturned.toFixed(2),
      yieldPercentage: yieldPercentage.toFixed(2)
    }, { emitEvent: false }); // Avoid infinite loop
  }
});






    

  this.firstFormGroup = this.fb.group({
  customerName: ['', Validators.required],
  partNo: ['', Validators.required],
  drawing: ['', Validators.required]
});

this.forthFormGroup = this.fb.group({
  // Add relevant fields if needed
});





this.thirdFormGroup = this.fb.group({
  selectedProcesses: [[], Validators.required]
});


  }

submit() {
  if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
    const customerDetails = this.firstFormGroup.value;
    const engineeringDetails = this.secondFormGroup.value;
    const selectedProcesses = this.thirdFormGroup.get('selectedProcesses')?.value || [];

   const finalPayload = {
  CustomerName: customerDetails.customerName,
  drawingNo: customerDetails.drawing,
  partName: customerDetails.partNo,
  processName: selectedProcesses.map((p: any) => p.processName),  // <-- fix here
  castingInputs: true,
  CastingWeight: engineeringDetails.castingWeight,
  Cavities: engineeringDetails.cavities,
  PouringWeight: engineeringDetails.pouringWeight,
  mouldingInputs: false,
  coreInputs: false
};


    console.log('Final Payload:', finalPayload);
    this.store.dispatch(addCustomerDetails({ customer: finalPayload }));

  } else {
    console.log('One or more steps are invalid');
  }

 
}


toggleExpandedRow(index: number, row: Process): void {
  this.expandedProcessIndex = this.expandedProcessIndex === index ? null : index;
  console.log('Expanded Process:', row);
}

getProcessByRow(row: Process): Process {
  return row;
}

expandedReviewIndex: number | null = null;

toggleExpandedReview(index: number): void {
  this.expandedReviewIndex = this.expandedReviewIndex === index ? null : index;
}

trackByIndex(index: number, item: any): number {
  return index;
}


}

