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



@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit {
  selectedCustomerDetails$: Observable<any>;
  customerDetails : CustomerdetailsIn[] = [];

  constructor(private store: Store<{ materials: MaterialState }>, 
    private dialog : MatDialog,
    private power: PowerService ) {}

  ngOnInit(): void {
  this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails); 

  this.selectedCustomerDetails$.subscribe(data => {
     this.customerDetails = data;
    console.log('Simplified Data:', data);
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

edit(id: string) {  
  this.dialog.open(UpdateaddcustomerdDetailsComponent, {
    width: '950px',
    height: '550px',
    data: { id: id },
    autoFocus: false  // 👈 passing the ID to the dialog
  });
  console.log('Id', id);
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
  });
}



}
