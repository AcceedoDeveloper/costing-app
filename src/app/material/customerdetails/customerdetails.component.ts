import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
filteredCustomersList: CustomerdetailsIn[] = [];

  // Search Filter properties
  searchFilterType: string = 'none'; // 'none', 'customerName', 'drawingNo', 'partNo'
  selectedSearchValue: string = '';
  searchFilterOptions: string[] = [];

  // Date Filter properties
  dateFilterType: string = 'none'; // 'none', 'date', 'week', 'month', 'year'
  
  // Native HTML input filters
  filters: any = {
    singleDate: '',
    week: '',
    month: '',
    year: null
  };

  // Pagination properties
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [ 10, 25, 50, 100];
  totalRecords: number = 0;
  paginatedCustomers: CustomerdetailsIn[] = [];

  // Expanded rows tracking
  expandedRows: Set<string> = new Set<string>();



  constructor(private store: Store<{ materials: MaterialState }>, 
    private dialog : MatDialog,
    private power: PowerService,
    private tooster: ToastrService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
  this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails);

this.selectedCustomerDetails$.subscribe((data: CustomerdetailsIn[]) => {
  this.customerDetails = data;
  console.log('Customer Details:', this.customerDetails);
  // Update search filter options when data changes
  if (this.searchFilterType !== 'none') {
    this.updateSearchFilterOptions();
  }
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
      disableClose: true
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
  const revision = customer?.revision || 0;
  // 📅 Get current year, start of month, and end of month
  const now = new Date();
  const yearNo = now.getFullYear();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; // 1st of month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]; // last day

  this.power.downloadQuotation({
    CustomerName: customerName,
    drawingNo: drawingNo,
    partName: partName,
    revision: revision,
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

// Removed - no longer using Material date pickers

// Handle search filter type change
onSearchFilterTypeChange() {
  this.selectedSearchValue = '';
  this.updateSearchFilterOptions();
  this.applyDateFilter();
}

// Update search filter options based on selected type
updateSearchFilterOptions() {
  this.searchFilterOptions = [];
  
  if (this.searchFilterType === 'none' || !this.customerDetails.length) {
    return;
  }

  const uniqueValues = new Set<string>();

  this.customerDetails.forEach(customer => {
    if (this.searchFilterType === 'customerName' && customer.CustomerName?.name) {
      uniqueValues.add(customer.CustomerName.name);
    } else if (this.searchFilterType === 'drawingNo' && customer.drawingNo) {
      uniqueValues.add(customer.drawingNo);
    } else if (this.searchFilterType === 'partNo' && customer.partName) {
      uniqueValues.add(customer.partName);
    }
  });

  this.searchFilterOptions = Array.from(uniqueValues).sort();
}

// Handle search value change
onSearchValueChange() {
  this.applyDateFilter();
}

// Get search filter label
getSearchFilterLabel(): string {
  switch (this.searchFilterType) {
    case 'customerName': return 'Select Customer Name';
    case 'drawingNo': return 'Select Drawing No';
    case 'partNo': return 'Select Part No';
    default: return '';
  }
}

// Handle filter type change
onFilterTypeChange() {
  // Reset all filter values when filter type changes
  this.filters.singleDate = '';
  this.filters.week = '';
  this.filters.month = '';
  this.filters.year = null;
  this.applyDateFilter();
}

// Handle native input changes
onDateChange() {
  this.applyDateFilter();
}

onWeekChange() {
  this.applyDateFilter();
}

onMonthChange() {
  this.applyDateFilter();
}

onYearChange() {
  this.applyDateFilter();
}

// Removed Material date picker and custom week picker methods - using native HTML inputs now

// Get week number from date (ISO week standard)
getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayOfWeek);
  const jan4 = new Date(d.getFullYear(), 0, 4);
  jan4.setHours(0, 0, 0, 0);
  const jan4Day = jan4.getDay() || 7;
  const jan4Thursday = new Date(jan4);
  jan4Thursday.setDate(jan4.getDate() + 4 - jan4Day);
  const weekNo = Math.ceil(((d.getTime() - jan4Thursday.getTime()) / 86400000 + 1) / 7);
  return weekNo;
}

// Get number of weeks in a year
getWeeksInYear(year: number): number {
  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const weekJan1 = this.getWeekNumber(jan1);
  const weekDec31 = this.getWeekNumber(dec31);
  if (weekDec31 === 1 && dec31.getDay() !== 0) {
    return weekJan1 === 53 ? 53 : 52;
  }
  return weekDec31;
}

// Get week date range for display
getWeekDateRange(year: number, week: number): { start: string; end: string } {
  const weekStart = this.getWeekStartDate(year, week);
  const weekEnd = this.getWeekEndDate(year, week);
  return {
    start: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
}

// Get start date of a week (Monday)
getWeekStartDate(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const jan4Thursday = new Date(jan4);
  jan4Thursday.setDate(jan4.getDate() + 4 - jan4Day);
  const week1Monday = new Date(jan4Thursday);
  week1Monday.setDate(jan4Thursday.getDate() - 3);
  const weekStart = new Date(week1Monday);
  weekStart.setDate(week1Monday.getDate() + (week - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Get end date of a week (Sunday)
getWeekEndDate(year: number, week: number): Date {
  const weekStart = this.getWeekStartDate(year, week);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

// Get month start date
getMonthStartDate(year: number, month: number): Date {
  return new Date(year, month, 1);
}

// Get month end date
getMonthEndDate(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

// Get year start date
getYearStartDate(year: number): Date {
  return new Date(year, 0, 1);
}

// Get year end date
getYearEndDate(year: number): Date {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

get filteredCustomers() {
  const search = this.searchText.toLowerCase().trim();

  // Get search filter value
  const searchFilterValue = this.selectedSearchValue ? this.selectedSearchValue.toLowerCase().trim() : '';

  // Calculate date range based on filter type using native inputs
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (this.dateFilterType === 'date' && this.filters.singleDate) {
    // Single date filter
    const date = new Date(this.filters.singleDate);
    startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    endDate.setHours(23, 59, 59, 999);
  } else if (this.dateFilterType === 'week' && this.filters.week) {
    // Week filter (format: YYYY-Www)
    const [year, week] = this.filters.week.split('-W').map(Number);
    const weekStart = this.getWeekStartDate(year, week);
    const weekEnd = this.getWeekEndDate(year, week);
    startDate = weekStart;
    endDate = weekEnd;
  } else if (this.dateFilterType === 'month' && this.filters.month) {
    // Month filter (format: YYYY-MM)
    const [year, month] = this.filters.month.split('-').map(Number);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (this.dateFilterType === 'year' && this.filters.year) {
    // Year filter
    const year = Number(this.filters.year);
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
  }

  const filtered = this.customerDetails
    .filter(c => !!c.CustomerName)  // remove null CustomerName
    .filter(c => {
      const customerName = c.CustomerName?.name?.toLowerCase() || '';
      const drawingNo = c.drawingNo?.toLowerCase() || '';
      const partName = c.partName?.toLowerCase() || '';
      const createdDate = new Date(c.createdAt || '');

      // Filter by search text (if still used)
      let matchesSearch = true;
      if (search) {
        matchesSearch =
        customerName.includes(search) ||
        drawingNo.includes(search) ||
        partName.includes(search);
      }

      // Filter by selected search filter value
      if (this.searchFilterType !== 'none' && searchFilterValue) {
        let matchesFilter = false;
        
        if (this.searchFilterType === 'customerName') {
          matchesFilter = customerName === searchFilterValue;
        } else if (this.searchFilterType === 'drawingNo') {
          matchesFilter = drawingNo === searchFilterValue;
        } else if (this.searchFilterType === 'partNo') {
          matchesFilter = partName === searchFilterValue;
        }
        
        if (!matchesFilter) {
          return false;
        }
      }

      // Filter by date range if date filter is active
      let matchesDate = true;
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = createdDate >= start && createdDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = createdDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = createdDate <= end;
      }

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      // Sort by updatedAt or createdAt in descending order (newest first)
      const dateA = new Date((a as any).updatedAt || a.createdAt || 0);
      const dateB = new Date((b as any).updatedAt || b.createdAt || 0);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

  // Update total records for paginator
  this.totalRecords = filtered.length;
  
  // Apply pagination
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  
  return filtered.slice(startIndex, endIndex);
}

// Removed percentage-related methods - no longer displaying percentage column

// Format ID with year, month, day, and sequential number for that date
getFormattedId(customer: any, index: number): string {
  // Get date from updatedAt or createdAt
  const dateStr = (customer as any).updatedAt || customer.createdAt;
  if (!dateStr) {
    return `${7781 + index}`;
  }
  
  const date = new Date(dateStr);
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year (e.g., 25 for 2025)
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month 01-12
  const day = date.getDate().toString().padStart(2, '0'); // Day 01-31
  
  // Find all customers with the same date (YYMMDD)
  const dateKey = `${year}${month}${day}`;
  const sameDateCustomers = this.customerDetails.filter(c => {
    const cDateStr = (c as any).updatedAt || c.createdAt;
    if (!cDateStr) return false;
    const cDate = new Date(cDateStr);
    const cYear = cDate.getFullYear().toString().slice(-2);
    const cMonth = (cDate.getMonth() + 1).toString().padStart(2, '0');
    const cDay = cDate.getDate().toString().padStart(2, '0');
    return `${cYear}${cMonth}${cDay}` === dateKey;
  });
  
  // Sort by createdAt (or updatedAt) to get consistent ordering
  sameDateCustomers.sort((a, b) => {
    const aDate = new Date(a.createdAt || (a as any).updatedAt || 0);
    const bDate = new Date(b.createdAt || (b as any).updatedAt || 0);
    return aDate.getTime() - bDate.getTime();
  });
  
  // Find the position of current customer in the same-date list
  const sequentialNumber = sameDateCustomers.findIndex(c => c._id === customer._id) + 1;
  const sequentialStr = sequentialNumber.toString().padStart(2, '0'); // 01, 02, 03, etc.
  
  return `${year}${month}${day}${sequentialStr}`;
}

onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
}

resetPagination() {
  this.pageIndex = 0;
}

// Toggle row expansion
toggleRow(customerId: string) {
  if (this.expandedRows.has(customerId)) {
    this.expandedRows.delete(customerId);
  } else {
    this.expandedRows.add(customerId);
  }
}

// Check if row is expanded
isRowExpanded(customerId: string): boolean {
  return this.expandedRows.has(customerId);
}

}
