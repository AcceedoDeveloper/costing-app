import { Component, OnInit } from '@angular/core';
import { loadCustomers } from '../store/master.action';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCustomers } from '../store/master.selector'; 
import { updateCustomer } from '../store/master.action'; 
import { addCustomer } from '../store/master.action';
import { deleteCustomer } from '../store/master.action'; 
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AddcustomerComponent} from './addcustomer/addcustomer.component';
import { Customer } from '../../../models/Customer-details.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})




export class CustomerComponent implements OnInit {
  customers$: Observable<any>;
  customers: any[] = [];
    paginatedCustomers: any[] = []; 

  pageSize = 5;
  pageIndex = 0;

  newCustomerName: string = '';
  isEditMode: boolean = false;
  currentEditId: string | null = null;

  displayedColumns: string[] = ['name', 'actions'];

  constructor(private store: Store, private dialog: MatDialog) {}

ngOnInit(): void {
  this.store.dispatch(loadCustomers());

  this.customers$ = this.store.select(selectCustomers);
 
  this.customers$.subscribe((customers) => {
    this.customers = customers;
    console.log('Customers:', this.customers);
    this.updatePaginatedCustomers(); 
  });
}


  addCustomer() {
    console.log('Add:', this.newCustomerName);
    const newCustomer = {
      name: this.newCustomerName.trim()
    };
    console.log('New Customer:', newCustomer);
    this.updatePaginatedCustomers();
    this.store.dispatch(addCustomer({ customer: newCustomer }));
    this.cancelAction();
  }

  startEdit(customer: any) {
    this.isEditMode = true;
    this.newCustomerName = customer.name;
    this.currentEditId = customer._id;
    console.log('Edit ID:', this.currentEditId, 'Name:', this.newCustomerName);
    
  }

updateCustomer() {
  if (this.currentEditId) {
   const updatedCustomer = {
  _id: this.currentEditId, // optional if needed on the backend
  name: this.newCustomerName.trim()
};
this.store.dispatch(updateCustomer({ id: this.currentEditId, data: updatedCustomer }));

    console.log('Update ID:', this.currentEditId, 'Name:', this.newCustomerName);
  }
  this.cancelAction();
}


deleteCustomer(id: string) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this customer?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      console.log('Confirmed Delete ID:', id);
      this.store.dispatch(deleteCustomer({ id }));
      this.cancelAction();
    } else {
      console.log('Delete Cancelled');
    }
  });
}

 openAddCustomer(customer?: Customer): void {
    const dialogRef = this.dialog.open(AddcustomerComponent, {
      width: '400px',
      data: customer ? { customer } : {}
    });

    dialogRef.afterClosed().subscribe(() => {
      this.store.dispatch(loadCustomers()); // Refresh customer list
    });
  }



  cancelAction() {
    this.isEditMode = false;
    this.newCustomerName = '';
    this.currentEditId = null;
  }

   updatePaginatedCustomers() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCustomers = this.customers.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedCustomers();
  }





















}

