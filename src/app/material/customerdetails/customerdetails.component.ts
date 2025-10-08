import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadCustomerDetails } from '../store/material.actions'; 
import { MaterialState } from '../store/material.reducer';
import { Observable } from 'rxjs';
import { getCustomerDetails } from '../store/material.selector'; 
import { MatDialog } from '@angular/material/dialog';
import { AddcustomerdetailsComponent} from './addcustomerdetails/addcustomerdetails.component';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { deleteCustomer } from '../store/material.actions';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { UpdateaddcustomerdDetailsComponent} from './updateaddcustomerd-details/updateaddcustomerd-details.component';
import { PowerService } from '../../services/power.service';
import {UpdateCustomerDetailsComponent } from './update-customer-details/update-customer-details.component';
import { ToastrService } from 'ngx-toastr';
import { ViewQuotationComponent } from './view-quotation/view-quotation.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {
  selectedCustomerDetails$: Observable<any>;
  customerDetails : CustomerdetailsIn[] = [];
  searchText: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  filteredCustomersList: CustomerdetailsIn[] = [];

  // Pagination properties
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [ 10, 25, 50, 100];
  totalRecords: number = 0;
  paginatedCustomers: CustomerdetailsIn[] = [];



  constructor(private store: Store<{ materials: MaterialState }>, 
    private dialog : MatDialog,
    private power: PowerService,
    private tooster: ToastrService ) {}

  ngOnInit(): void {
  this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails);

this.selectedCustomerDetails$.subscribe((data: CustomerdetailsIn[]) => {
  this.customerDetails = data;
  console.log('Customer Details:', this.customerDetails);
  
});




}

addCustomerDetails() {
   this.dialog.open(AddcustomerdetailsComponent, {
    width: '100%',
    height: '650px',
    autoFocus: false,
    disableClose: true
  });

  
}



getFirstProcessCost(customer: any): number {
  return customer?.processName?.length ? customer.processName[0].processCost : 0;
}


delete(id: string) {
  console.log('ID', id);
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '300px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this customer?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'confirm') {
      this.store.dispatch(deleteCustomer({ id }));
    }
  });
}

// edit(id: string) {  
//   this.dialog.open(UpdateaddcustomerdDetailsComponent, {
//     width: '950px',
//     height: '550px',
//     data: { id: id },
//     autoFocus: false  
//   });
//   console.log('Id', id);
// }


edit(id: string) {
  const customer = this.customerDetails.find(c => c._id === id);

  if (customer) {
    this.dialog.open(UpdateCustomerDetailsComponent, {
      width: '100%',
      height: '650px',
      data: {
        mode: 'edit',
        customerData: customer
      },
      autoFocus: false,
      disableClose: false
    });
    this.store.dispatch(loadCustomerDetails());
    console.log('Editing Customer:', customer);
  } else {
    console.warn('Customer not found for editing:', id);
  }
}


viewQuotation(customer: any) {
  this.dialog.open(ViewQuotationComponent, {
    width: '100%',
    height: '650px',
    data: customer,
    autoFocus: false,
    disableClose: false
  });
}

downloadQuotation(customer: any) {
  const customerName = customer?.CustomerName?.name || '';
  const drawingNo = customer?.drawingNo || '';
  const partName = customer?.partName || '';

  // 📅 Get current year, start of month, and end of month
  const now = new Date();
  const yearNo = now.getFullYear();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; // 1st of month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]; // last day

  this.power.downloadQuotation({
    CustomerName: customerName,
    drawingNo: drawingNo,
    partName: partName,
    yearNo: yearNo,
    start: start,
    end: end
  }).subscribe(blob => {
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = `${customerName}_quotation.xlsx`;
    link.click();
     this.tooster.success('Quotation downloaded successfully!', 'Success');
  });
}

applyDateFilter() {
  this.pageIndex = 0; // Reset to first page when filter changes
}

get filteredCustomers() {
  const search = this.searchText.toLowerCase().trim();

  const filtered = this.customerDetails
    .filter(c => !!c.CustomerName)  // remove null CustomerName
    .filter(c => {
      const customerName = c.CustomerName?.name?.toLowerCase() || '';
      const drawingNo = c.drawingNo?.toLowerCase() || '';
      const partName = c.partName?.toLowerCase() || '';
      const createdDate = new Date(c.createdAt || '');

      const matchesSearch =
        customerName.includes(search) ||
        drawingNo.includes(search) ||
        partName.includes(search);

      const matchesDate =
        (!this.startDate || createdDate >= new Date(this.startDate)) &&
        (!this.endDate || createdDate <= new Date(this.endDate));

      return matchesSearch && matchesDate;
    });

  // Update total records for paginator
  this.totalRecords = filtered.length;
  
  // Apply pagination
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  
  return filtered.slice(startIndex, endIndex);
}

// Progress circle methods
getProgressPercentage(customer: any): number {
  // Calculate percentage based on some logic - you can modify this
  const processCount = customer.processName?.length || 0;
  const maxProcesses = 5; // Assuming max 5 processes
  return Math.min(Math.round((processCount / maxProcesses) * 100), 100);
}

getProgressDashArray(customer: any): string {
  const percentage = this.getProgressPercentage(customer);
  const circumference = 2 * Math.PI * 18; // radius = 18
  const offset = circumference - (percentage / 100) * circumference;
  return `${circumference} ${circumference}`;
}

getProgressOffset(customer: any): string {
  const percentage = this.getProgressPercentage(customer);
  const circumference = 2 * Math.PI * 18; // radius = 18
  return `${circumference - (percentage / 100) * circumference}`;
}

onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}

resetPagination() {
  this.pageIndex = 0;
}


}
