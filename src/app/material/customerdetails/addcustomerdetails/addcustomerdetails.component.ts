import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action'
import { selectCustomers } from '../../../master/master/store/master.selector';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-addcustomerdetails',
  templateUrl: './addcustomerdetails.component.html',
  styleUrls: ['./addcustomerdetails.component.css']
})
export class AddcustomerdetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];

  @ViewChild('stepper') stepper!: MatStepper;

  thirdFormGroup!: FormGroup;
processList: string[] = ['Casting', 'Machining', 'Heat Treatment', 'Inspection']; // example list


  isLinear = false;
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {} 

 ngOnInit(): void {
    this.store.dispatch(loadCustomers());

    this.customer$ = this.store.select(selectCustomers);
    this.customer$.subscribe(customer => {
      this.customer = customer;
      console.log(customer);
    });

    this.firstFormGroup = this.fb.group({
  customerName: ['', Validators.required],
  partNo: ['', Validators.required],
  drawing: ['', Validators.required]
});


    this.secondFormGroup = this.fb.group({
  castingWeight: ['', Validators.required],
  cavities: ['', Validators.required],
  pouringWeight: ['', Validators.required]
});


this.thirdFormGroup = this.fb.group({
  selectedProcesses: [[], Validators.required]
});


  }
}

