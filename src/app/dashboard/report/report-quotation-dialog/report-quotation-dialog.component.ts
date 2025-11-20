import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardService } from '../../../services/dashboard.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report-quotation-dialog',
  templateUrl: './report-quotation-dialog.component.html',
  styleUrls: ['./report-quotation-dialog.component.css']
})
export class ReportQuotationDialogComponent implements OnInit {
  quotationData: any = null;
  quotationCalc: any = null;
  today: Date = new Date();
  showQuotationView: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: any },
    private dialogRef: MatDialogRef<ReportQuotationDialogComponent>,
    private dashboardService: DashboardService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.loadQuotationData();
  }

  loadQuotationData(): void {
    console.log('Data:', this.data);
    const customer = this.data.customer;
    const customerName = customer?.CustomerName?.name || '';
    const drawingNo = customer?.drawingNo || '';
    const partName = customer?.partName || '';
    const customerID = (customer as any)?.ID || '';
    const revisionCount = (customer as any)?.revision?.length || 0;

    if (!customerName || !drawingNo || !partName || !customerID) {
      this.toastr.error('Missing customer information for quotation', 'Error');
      return;
    }

    console.log('Revision Count:', revisionCount);
    this.dashboardService.getQuoteData(customerName, drawingNo, partName, customerID, revisionCount).subscribe({
      next: (response) => {
        console.log('Quotation data loaded:', response);
        this.quotationData = response;
        this.quotationCalc = response.calculations?.[0] || {};
      },
      error: (error) => {
        console.error('Error loading quotation data:', error);
        this.toastr.error('Failed to load quotation data', 'Error');
      }
    });
  }

  submitForm(): void {
    this.dialogRef.close();
  }
}
