import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadCustomerDetails } from '../store/material.actions'; // update the path as needed
import { MaterialState } from '../store/material.reducer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {
  // This holds the simplified selected fields
  selectedCustomerDetails$: Observable<any>;

  constructor(private store: Store<{ materials: MaterialState }>) {}

  ngOnInit(): void {
    this.store.dispatch(loadCustomerDetails());

    this.selectedCustomerDetails$ = this.store.select(state => {
      return state.materials.customers.map(customer => ({
        customerName: customer.CustomerName.name,
        castingInputs: customer.Inputs?.castingInputs || [],
        coreInputs: customer.Inputs?.coreInputs || [],
        mouldingInputs: customer.Inputs?.mouldingInputs || [],
        grade: customer.grade?.name,
        processType: customer.processType?.name
      }));
    });

    this.selectedCustomerDetails$.subscribe(data => {
      console.log('Simplified Data:', data);
    });
  }
}
