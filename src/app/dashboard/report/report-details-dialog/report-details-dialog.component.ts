import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomerdetailsIn } from '../../../models/Customer-details.model';

@Component({
  selector: 'app-report-details-dialog',
  templateUrl: './report-details-dialog.component.html',
  styleUrls: ['./report-details-dialog.component.css']
})
export class ReportDetailsDialogComponent implements OnInit {
  customer: CustomerdetailsIn;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customer: CustomerdetailsIn },
    private dialogRef: MatDialogRef<ReportDetailsDialogComponent>
  ) {
    this.customer = data.customer;
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getProcessCount(): number {
    return this.customer.processName && Array.isArray(this.customer.processName) 
      ? this.customer.processName.length 
      : 0;
  }

  getStatusColor(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'check_circle';
      case 'completed':
        return 'done_all';
      case 'pending':
        return 'schedule';
      default:
        return 'info';
    }
  }
}

