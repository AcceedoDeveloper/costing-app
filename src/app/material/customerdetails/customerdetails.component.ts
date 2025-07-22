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
    width: '850px',
    height: '550px',
    autoFocus: false,
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
    width: '850px',
    height: '550px',
    data: { id: id },
    autoFocus: false  // 👈 passing the ID to the dialog
  });
  console.log('Id', id);
}



downloadFile() {
  this.power.downloadQuotation({
    CustomerName: 'BMW',
    drawingNo: 'dfsh',
    partNo: 'xfdh',
    yearNo: '2025',
    start: '2025-07-01',
    end: '2025-07-19'
  }).subscribe(blob => {
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = 'quotation.xlsx'; // ✅ Excel extension
    link.click();
    window.URL.revokeObjectURL(downloadURL); // clean up
  }, error => {
    console.error('Download error:', error);
  });
}


}
