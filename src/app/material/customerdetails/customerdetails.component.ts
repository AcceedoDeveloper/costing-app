import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadCustomerDetails } from '../store/material.actions'; 
import { MaterialState } from '../store/material.reducer';
import { Observable } from 'rxjs';
import { getCustomerDetails } from '../store/material.selector'; 
import { MatDialog } from '@angular/material/dialog';
import { AddcustomerdetailsComponent} from './addcustomerdetails/addcustomerdetails.component';
import  { MaterialTypeService} from '../../services/material-type.service';
import { CustomerdetailsIn } from '../../models/Customer-details.model';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {
  selectedCustomerDetails$: Observable<any>;
  customerDetails : CustomerdetailsIn[] = [];

  constructor(private store: Store<{ materials: MaterialState }>, private dialog : MatDialog, private materialService: MaterialTypeService) {}

  ngOnInit(): void {
  this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails); 

  this.selectedCustomerDetails$.subscribe(data => {
    console.log('Simplified Data:', data);
  });

  this.materialService.getCustomerDetailsPeocess().subscribe({
  next: (data) => {
    this.customerDetails = data;
    console.log('Customer Details:', this.customerDetails);
  },
  error: (err) => {
    console.error('Failed to fetch customer details', err);
  }
});

}

addCustomerDetails() {
  const dialogRef = this.dialog.open(AddcustomerdetailsComponent, {
    width: '850px',
    height: '550px',
    autoFocus: false,
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      // Refresh the customer list manually
      this.loadCustomerList();
    }
  });
}



getFirstProcessCost(customer: any): number {
  return customer?.processName?.length ? customer.processName[0].processCost : 0;
}

loadCustomerList() {
  this.materialService.getCustomerDetailsPeocess().subscribe({
    next: (data) => {
      this.customerDetails = data;
      console.log('🔄 Refreshed Customer Details:', this.customerDetails);
    },
    error: (err) => {
      console.error('❌ Failed to refresh customer details', err);
    }
  });
}



}
