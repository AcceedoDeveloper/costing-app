import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { loadCustomerDetails } from '../../material/store/material.actions';
import { MaterialState } from '../../material/store/material.reducer';
import { getCustomerDetails } from '../../material/store/material.selector';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { MatDialog } from '@angular/material/dialog';
import { ReportDetailsDialogComponent } from './report-details-dialog/report-details-dialog.component';
import { ViewQuotationComponent } from '../../material/customerdetails/view-quotation/view-quotation.component';
import { PowerService } from '../../services/power.service';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../services/dashboard.service';
import { ReportQuotationDialogComponent } from './report-quotation-dialog/report-quotation-dialog.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, OnDestroy {
  customerDetails$: Observable<CustomerdetailsIn[]>;
  customerDetails: CustomerdetailsIn[] = [];
  private subscription: Subscription = new Subscription();

  // Statistics
  totalCustomers: number = 0;
  totalProcesses: number = 0;
  activeCustomers: number = 0;
  uniqueCustomers: Set<string> = new Set();

  // Filter properties
  searchText: string = '';
  selectedStatus: string = 'all';


  constructor(
    private store: Store<{ materials: MaterialState }>,
    private dialog: MatDialog,
    private powerService: PowerService,
    private toastr: ToastrService,
    private dashboardService: DashboardService
  ) {
    this.customerDetails$ = this.store.select(getCustomerDetails);
  }

  ngOnInit(): void {
    this.store.dispatch(loadCustomerDetails());
    
    const sub = this.customerDetails$.subscribe((data: CustomerdetailsIn[]) => {
      this.customerDetails = data || [];
      this.calculateStatistics();
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  calculateStatistics(): void {
    this.totalCustomers = this.customerDetails.length;
    this.uniqueCustomers.clear();
    
    this.customerDetails.forEach(customer => {
      if (customer.CustomerName?.name) {
        this.uniqueCustomers.add(customer.CustomerName.name);
      }
      if (customer.processName && Array.isArray(customer.processName)) {
        this.totalProcesses += customer.processName.length;
      }
      if (customer.Status === 'active' || customer.Status === 'Active') {
        this.activeCustomers++;
      }
    });
  }

  get filteredCustomers(): CustomerdetailsIn[] {
    let filtered = [...this.customerDetails];

    // Search filter
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(customer => 
        customer.CustomerName?.name?.toLowerCase().includes(search) ||
        customer.drawingNo?.toLowerCase().includes(search) ||
        customer.partName?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(customer => 
        customer.Status?.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    return filtered;
  }

  getProcessCount(customer: CustomerdetailsIn): number {
    return customer.processName && Array.isArray(customer.processName) 
      ? customer.processName.length 
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

  trackByCustomerId(index: number, customer: CustomerdetailsIn): string {
    return customer._id || index.toString();
  }

  viewDetails(customer: CustomerdetailsIn): void {
    this.dialog.open(ReportDetailsDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { customer },
      autoFocus: false
    });
  }

  viewQuotation(customer: CustomerdetailsIn): void {
    this.dialog.open(ViewQuotationComponent, {
      width: '100%',
      height: '650px',
      data: customer,
      autoFocus: false,
      disableClose: false
    });
  }

  downloadQuotation(customer: CustomerdetailsIn): void {
    const customerName = customer?.CustomerName?.name || '';
    const drawingNo = customer?.drawingNo || '';
    const partName = customer?.partName || '';
    const revision = (customer as any)?.revision || 0;
    
    const now = new Date();
    const yearNo = now.getFullYear();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    this.powerService.downloadQuotation({
      CustomerName: customerName,
      drawingNo: drawingNo,
      partName: partName,
      revision: revision,
      yearNo: yearNo,
      start: start,
      end: end
    }).subscribe({
      next: (blob) => {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${customerName}_quotation.xlsx`;
        link.click();
        window.URL.revokeObjectURL(downloadURL);
        this.toastr.success('Quotation downloaded successfully!', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to download quotation', 'Error');
        console.error('Download error:', error);
      }
    });
  }

  exportToCSV(): void {
    const headers = ['Customer Name', 'Drawing No', 'Part Name', 'Status', 'Processes', 'Created At'];
    const rows = this.filteredCustomers.map(customer => [
      customer.CustomerName?.name || 'N/A',
      customer.drawingNo || 'N/A',
      customer.partName || 'N/A',
      customer.Status || 'N/A',
      this.getProcessCount(customer).toString(),
      customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastr.success('Report exported successfully!', 'Success');
  }

  viewQuotationsreport(customer: CustomerdetailsIn): void {
    this.dialog.open(ReportQuotationDialogComponent, {
      width: '80%',
      maxWidth: '1200px',
      maxHeight: '95vh',
      data: { customer },
      autoFocus: false,
      disableClose: false
    });
  }
}
