import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadCustomerDetails } from '../store/material.actions'; 
import { MaterialState } from '../store/material.reducer';
import { Observable, Subscription } from 'rxjs';
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
import { CompareRevisionsComponent } from './compare-revisions/compare-revisions.component';
import { PageEvent } from '@angular/material/paginator';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css']
})
export class CustomerdetailsComponent implements OnInit, OnDestroy {
  selectedCustomerDetails$: Observable<any>;
  customerDetails : CustomerdetailsIn[] = [];
  searchText: string = '';
  filteredCustomersList: CustomerdetailsIn[] = [];
  private subscription: Subscription = new Subscription();
  loading: boolean = false;
  selectedCustomer: string | null = null;
  selectedParts: any[] = [];
  pdfgenarate: boolean = false;
  showPdfPopup: boolean = false;   // popup open/close
  attention: string = '';
regards: string = '';
predetails: boolean = false;


tableUserInputs: any[] = [];     // store user-entered data

materialComposition = {
  C: '',
  Si: '',
  Mn: '',
  Ni: '',
  Cr: '',
  Mo: ''
};


termsAndConditions: string[] = [
  "Ingate and Parting Line Projections: Maximum allowable projection is 1.00 mm.",
  "Raw Casting Models: 2D and 3D models are required during the development stage.",
  "Casting Soundness: Soundness level shall be Level III (maximum) as per ASTM E446.",
  "Unspecified Tolerances: Raw casting tolerances will conform to ISO 8062 CT8 grade.",
  "Drawing Given Tolerance Dia 1060mm -0.20 & -0.40 is not feasible. Required ±0.40mm.",
  "Component teeth tolerance ±0.20mm is not feasible. Required ±0.50mm.",
  "Machining Stock: Minimum machining allowance of 2.00 mm per side is recommended."
];


commercialTerms: any[] = [
  {
    heading: "Pricing",
    points: [
      "The price of component will vary if there is any change in the following factors.",
      "Component weight",
      "Raw material price",
      "Modification in payment terms"
    ]
  },
  {
    heading: "Raw Material Price Terms",
    points: [
      "We accept 3% fluctuation in RM Prices.",
      "Any variation beyond this threshold will be passed on to the customer every quarter."
    ]
  },
  {
    heading: "Casting Weight Consideration",
    points: [
      "ISC will determine the as-cast weight using customer-provided 3D models.",
      "Machining stock will be decided by ISC."
    ]
  },
  {
    heading: "Pricing & Taxes",
    points: [
      "The quoted rates are basic and exclude statutory taxes.",
      "HSN 732599 (Casting) 18% GST",
      "HSN 84803000 (Tools) 18% GST",
      "Tax changes will be passed to customer"
    ]
  },
  {
    heading: "Incoterms",
    points: [ "The quoted rates are based on EX WORKS." ]
  },
  {
    heading: "Payment Terms",
    points: [
      "For Casting: Payment due within 75 days",
      "50% tool cost payable with Tooling PO",
      "Remaining 50% payable on PPAP or 120 days"
    ]
  },
  {
    heading: "Volume Consideration",
    points: ["The quoted rates are based on the MOQ."]
  },
  {
    heading: "Packaging",
    points: ["The quoted rates based on Sea Worthy Packaging."]
  },
  {
    heading: "Lead Time",
    points: [
      "Raw Casting Sample: 12 weeks from receipt of PO & advance."
    ]
  },
  {
    heading: "Validation",
    points: [
      "Rates valid for 30 days from date of offer."
    ]
  }
];




  // Search Filter properties
  searchFilterType: string = 'none'; // 'none', 'customerName', 'drawingNo', 'partNo'
  selectedSearchValue: string = '';
  searchFilterOptions: string[] = [];

  // Date Filter properties
  dateFilterType: string = 'month'; // 'none', 'date', 'week', 'month', 'year'
  
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
  currentPage: number = 1;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  totalRecords: number = 0;
  paginatedCustomers: CustomerdetailsIn[] = [];
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  totalPages: number = 0;

  // Expanded rows tracking
  expandedRows: Set<string> = new Set<string>();
  
  // Revision tracking
  expandedRevisions: Set<string> = new Set<string>();
  
  // Selected revision for each customer (for nested table view)
  selectedRevisionForCustomer: { [customerId: string]: number } = {}; // -1 means latest, 0+ means specific revision index
  
  // Selected revisions for comparison (multiple checkboxes)
  selectedRevisionsForComparison: { [customerId: string]: number[] } = {}; // Array of selected revision indices

  // View toggle: 'parts' for current table, 'customers' for customer view
  viewMode: 'parts' | 'customers' = 'parts';

  // Customer view: expanded customers, partName groups, and parts
  expandedCustomers: Set<string> = new Set<string>();
  expandedPartNameGroups: Set<string> = new Set<string>(); // Key: customerName_partName
  expandedParts: Set<string> = new Set<string>();

  // Grouped customer data
  groupedCustomerData: { [customerName: string]: CustomerdetailsIn[] } = {};
  
  // Grouped partName data within customers
  groupedPartNameData: { [customerName: string]: { [partName: string]: CustomerdetailsIn[] } } = {};

  constructor(
    private store: Store<{ materials: MaterialState }>, 
    private dialog : MatDialog,
    private power: PowerService,
    private tooster: ToastrService,
    private cdr: ChangeDetectorRef,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    // Initialize filters with current date values
    this.initializeDateFilters();
    this.loadCustomerDetails();
  }

  // Initialize date filters with current date
  initializeDateFilters(): void {
    const now = new Date();
    this.filters.singleDate = now.toISOString().split('T')[0];
    this.filters.week = this.getCurrentWeek();
    this.filters.month = now.toISOString().slice(0, 7);
    this.filters.year = now.getFullYear();
  }

  // Get current week in ISO format (YYYY-Www)
  getCurrentWeek(): string {
    const now = new Date();
    const year = now.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCustomerDetails(): void {
    this.loading = true;
    
    // Prepare API parameters
    const params: any = {
      customerName: '',
      partName: '',
      drawingNo: '',
      revision: '',
      StartDate: '',
      EndDate: '',
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add search filters
    if (this.searchFilterType === 'customerName' && this.selectedSearchValue) {
      params.customerName = this.selectedSearchValue;
    } else if (this.searchFilterType === 'drawingNo' && this.selectedSearchValue) {
      params.drawingNo = this.selectedSearchValue;
    } else if (this.searchFilterType === 'partNo' && this.selectedSearchValue) {
      params.partName = this.selectedSearchValue;
    }

    // Add date filters
    if (this.dateFilterType === 'date' && this.filters.singleDate) {
      const date = new Date(this.filters.singleDate);
      const dateStr = date.toISOString().split('T')[0];
      params.StartDate = dateStr;
      params.EndDate = dateStr;
    } else if (this.dateFilterType === 'week' && this.filters.week) {
      const [year, week] = this.filters.week.split('-W').map(Number);
      const weekStart = this.getWeekStartDate(year, week);
      const weekEnd = this.getWeekEndDate(year, week);
      params.StartDate = weekStart.toISOString().split('T')[0];
      params.EndDate = weekEnd.toISOString().split('T')[0];
    } else if (this.dateFilterType === 'month' && this.filters.month) {
      const [year, month] = this.filters.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      params.StartDate = startDate.toISOString().split('T')[0];
      params.EndDate = endDate.toISOString().split('T')[0];
    } else if (this.dateFilterType === 'year' && this.filters.year) {
      const year = Number(this.filters.year);
      params.StartDate = `${year}-01-01`;
      params.EndDate = `${year}-12-31`;
    }

    const sub = this.reportsService.getCustomerDetails(params).subscribe({
      next: (response: any) => {
        this.customerDetails = response.data || [];
        // Use pagination object from API response
        if (response.pagination) {
          this.totalRecords = response.pagination.totalRecords || 0;
          this.hasNextPage = response.pagination.hasNextPage || false;
          this.hasPreviousPage = response.pagination.hasPreviousPage || false;
          this.totalPages = response.pagination.totalPages || 0;
          this.currentPage = response.pagination.currentPage || 1;
          this.pageIndex = (response.pagination.currentPage || 1) - 1; // Convert to 0-based index
        } else {
          // Fallback if pagination object is not present
          this.totalRecords = response.total || response.count || this.customerDetails.length;
          this.hasNextPage = false;
          this.hasPreviousPage = false;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        }
        this.loading = false;
        console.log('Customer Details:', this.customerDetails);
        console.log('Pagination:', {
          totalRecords: this.totalRecords,
          hasNextPage: this.hasNextPage,
          hasPreviousPage: this.hasPreviousPage,
          totalPages: this.totalPages,
          currentPage: this.currentPage
        });
        this.groupCustomerData();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading customer details:', error);
        this.tooster.error('Failed to load customer details', 'Error');
        this.customerDetails = [];
        this.totalRecords = 0;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.subscription.add(sub);
  }

addCustomerDetails() {
   const dialogRef = this.dialog.open(AddcustomerdetailsComponent, {
    width: '100%',
    height: '650px',
    autoFocus: false,
    disableClose: true
  });

  // Reload data after dialog closes
  dialogRef.afterClosed().subscribe(() => {
    this.loadCustomerDetails();
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
      // Reload data after deletion
      setTimeout(() => {
        this.loadCustomerDetails();
      }, 500);
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
    const dialogRef = this.dialog.open(UpdateCustomerDetailsComponent, {
      width: '100%',
      height: '650px',
      data: {
        mode: 'edit',
        customerData: customer
      },
      autoFocus: false,
      disableClose: true
    });
    
    // Reload data after dialog closes
    dialogRef.afterClosed().subscribe(() => {
      this.loadCustomerDetails();
    });
    
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

compareRevisions(customer: any) {
  if (this.getAllRevisions(customer).length < 2) {
    this.tooster.warning('At least 2 revisions are required for comparison', 'Warning');
    return;
  }
  
  this.dialog.open(CompareRevisionsComponent, {
    width: '95%',
    maxWidth: '1400px',
    height: '85vh',
    data: { customer: customer },
    autoFocus: false,
    disableClose: false
  });
}

downloadQuotation(customer: any) {
  const customerName = customer?.CustomerName?.name || '';
  const drawingNo = customer?.drawingNo || '';
  const partName = customer?.partName || '';
  const ID = customer?.ID || 0;

  const now = new Date();
  const yearNo = now.getFullYear();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const revisionCount = customer?.revision?.length || 0;

  this.power.downloadQuotation({
    CustomerName: customerName,
    drawingNo: drawingNo,
    partName: partName,
    ID: ID,
    yearNo: yearNo,
    start: start,
    end: end,
    revision: revisionCount   // ✅ critical
  }).subscribe({
    next: blob => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = `${customerName}_quotation.xlsx`;
      link.click();
      this.tooster.success('Quotation downloaded successfully!', 'Success');
    },
    error: err => {
      console.error("Download Failed:", err);
      this.tooster.error('Failed to download quotation!', 'Error');
    }
  });
}


applyDateFilter() {
  this.currentPage = 1;
  this.pageIndex = 0; // Reset to first page when filter changes
  this.loadCustomerDetails();
}

// Removed - no longer using Material date pickers

// Handle search filter type change
onSearchFilterTypeChange() {
  this.selectedSearchValue = '';
  this.updateSearchFilterOptions();
  this.applyDateFilter();
}

// Update search filter options based on selected type - fetch from API
updateSearchFilterOptions() {
  this.searchFilterOptions = [];
  
  if (this.searchFilterType === 'none') {
    return;
  }

  // Fetch all records from API (without pagination) to get all unique values
  const params: any = {
    customerName: '',
    partName: '',
    drawingNo: '',
    revision: '',
    StartDate: '',
    EndDate: '',
    page: 1,
    limit: 10000 // Large limit to get all records for filter options
  };

  const sub = this.reportsService.getCustomerDetails(params).subscribe({
    next: (response) => {
      const allCustomers = response.data || [];
      const uniqueValues = new Set<string>();

      allCustomers.forEach(customer => {
        if (this.searchFilterType === 'customerName' && customer.CustomerName?.name) {
          uniqueValues.add(customer.CustomerName.name);
        } else if (this.searchFilterType === 'drawingNo' && customer.drawingNo) {
          uniqueValues.add(customer.drawingNo);
        } else if (this.searchFilterType === 'partNo' && customer.partName) {
          uniqueValues.add(customer.partName);
        }
      });

      this.searchFilterOptions = Array.from(uniqueValues).sort();
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error loading filter options:', error);
      this.tooster.error('Failed to load filter options', 'Error');
    }
  });

  this.subscription.add(sub);
}

// Handle search value change
onSearchValueChange() {
  this.currentPage = 1;
  this.pageIndex = 0;
  this.loadCustomerDetails();
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
  // Initialize the selected filter type with current date values
  const now = new Date();
  
  if (this.dateFilterType === 'date') {
    this.filters.singleDate = now.toISOString().split('T')[0];
  } else if (this.dateFilterType === 'week') {
    this.filters.week = this.getCurrentWeek();
  } else if (this.dateFilterType === 'month') {
    this.filters.month = now.toISOString().slice(0, 7);
  } else if (this.dateFilterType === 'year') {
    this.filters.year = now.getFullYear();
  }
  
  // Reset other filter values
  if (this.dateFilterType !== 'date') {
    this.filters.singleDate = '';
  }
  if (this.dateFilterType !== 'week') {
    this.filters.week = '';
  }
  if (this.dateFilterType !== 'month') {
    this.filters.month = '';
  }
  if (this.dateFilterType !== 'year') {
    this.filters.year = null;
  }
  
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
  // Since filtering is now done server-side, just return the customerDetails
  // Client-side search text filtering can still be applied if needed
  const search = this.searchText.toLowerCase().trim();
  
  if (search) {
    return this.customerDetails.filter(c => {
      const customerName = c.CustomerName?.name?.toLowerCase() || '';
      const drawingNo = c.drawingNo?.toLowerCase() || '';
      const partName = c.partName?.toLowerCase() || '';
      return customerName.includes(search) || drawingNo.includes(search) || partName.includes(search);
    });
  }
  
  return this.customerDetails;
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
  this.currentPage = event.pageIndex + 1; // API uses 1-based page numbers
  this.pageSize = event.pageSize;
  this.loadCustomerDetails();
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
    // Initialize selected revision to latest when row is expanded
    const customer = this.customerDetails.find(c => c._id === customerId);
    if (customer) {
      const allRevisions = this.getAllRevisions(customer);
      if (allRevisions.length > 0 && this.selectedRevisionForCustomer[customerId] === undefined) {
        // Set to latest revision (last index)
        this.selectedRevisionForCustomer[customerId] = allRevisions.length - 1;
      }
    }
  }
}

// Check if row is expanded
isRowExpanded(customerId: string): boolean {
  return this.expandedRows.has(customerId);
}

// Get latest revision for a customer
getLatestRevision(customer: any): any {
  const revisionArray = customer?.Revision || customer?.revision;
  if (revisionArray && Array.isArray(revisionArray) && revisionArray.length > 0) {
    return revisionArray[revisionArray.length - 1];
  }
  return null;
}

// Get revision total process cost
getRevisionTotalCost(revision: any): number {
  if (revision?.totalProcessCost) {
    return revision.totalProcessCost;
  }
  // Calculate from processName if totalProcessCost is not available
  if (revision?.processName && Array.isArray(revision.processName)) {
    return revision.processName.reduce((sum: number, process: any) => {
      return sum + (process.processCost || 0);
    }, 0);
  }
  return 0;
}

// Get all revisions for a customer
getAllRevisions(customer: any): any[] {
  const revisionArray = customer?.Revision || customer?.revision;
  if (revisionArray && Array.isArray(revisionArray)) {
    return revisionArray;
  }
  return [];
}

// Toggle revision expansion
toggleRevision(customerId: string): void {
  if (this.expandedRevisions.has(customerId)) {
    this.expandedRevisions.delete(customerId);
  } else {
    this.expandedRevisions.add(customerId);
  }
}

// Check if revision is expanded
isRevisionExpanded(customerId: string): boolean {
  return this.expandedRevisions.has(customerId);
}

// Get process count for a customer (from processName or latest revision)
getProcessCount(customer: any): number {
  if (customer?.processName && Array.isArray(customer.processName) && customer.processName.length > 0) {
    return customer.processName.length;
  }
  const latestRevision = this.getLatestRevision(customer);
  if (latestRevision?.processName && Array.isArray(latestRevision.processName) && latestRevision.processName.length > 0) {
    return latestRevision.processName.length;
  }
  return 0;
}

// Get Subtotal Metal from quotationData
getSubtotalMetal(customer: any): number {
  const calc = customer?.quotationData?.calculations?.[0];
  if (calc?.subtotalMetalTotalCost) {
    return calc.subtotalMetalTotalCost;
  }
  if (calc?.subtotalMetalperkg && customer?.castingInputs?.CastingWeight) {
    return calc.subtotalMetalperkg * customer.castingInputs.CastingWeight;
  }
  return 0;
}

// Get Sub Total Labour from quotationData
getSubtotalLabour(customer: any): number {
  const calc = customer?.quotationData?.calculations?.[0];
  if (calc?.subtotalLabourTotalCost) {
    return calc.subtotalLabourTotalCost;
  }
  return 0;
}

// Get Sub Total Power from quotationData
getSubtotalPower(customer: any): number {
  const calc = customer?.quotationData?.calculations?.[0];
  if (calc?.subtotalPowerTotalCost) {
    return calc.subtotalPowerTotalCost;
  }
  return 0;
}

// Get grade name from nested grade structure
getGradeName(process: any): string {
  // Check if grade is a simple string or object
  if (typeof process?.grade === 'string') {
    return process.grade;
  }
  if (process?.grade?.name) {
    return process.grade.name;
  }
  
  // Check nested array structure: grade[0][0].name or grade[0][0].gradeNo
  if (process?.grade && Array.isArray(process.grade) && process.grade.length > 0) {
    const firstGradeArray = process.grade[0];
    if (Array.isArray(firstGradeArray) && firstGradeArray.length > 0) {
      const gradeObj = firstGradeArray[0];
      return gradeObj?.name || gradeObj?.gradeNo || '-';
    }
    // If it's not nested, check first element
    if (firstGradeArray?.name || firstGradeArray?.gradeNo) {
      return firstGradeArray.name || firstGradeArray.gradeNo;
    }
  }
  
  return '-';
}

// Get all raw materials from process (both process-level and grade-level)
getProcessMaterials(process: any): any[] {
  const materials: any[] = [];
  
  // First, check process-level rawMaterial
  if (process?.rawMaterial && Array.isArray(process.rawMaterial) && process.rawMaterial.length > 0) {
    materials.push(...process.rawMaterial);
  }
  
  // Then, check grade-level rawMaterial from nested structure
  if (process?.grade && Array.isArray(process.grade) && process.grade.length > 0) {
    const firstGradeArray = process.grade[0];
    if (Array.isArray(firstGradeArray) && firstGradeArray.length > 0) {
      const gradeObj = firstGradeArray[0];
      if (gradeObj?.rawMaterial && Array.isArray(gradeObj.rawMaterial) && gradeObj.rawMaterial.length > 0) {
        // Add grade materials, avoiding duplicates
        gradeObj.rawMaterial.forEach((rm: any) => {
          // Check if this type already exists in materials
          const existingIndex = materials.findIndex(m => m.type === rm.type);
          if (existingIndex >= 0) {
            // Merge materialsUsed if type exists
            if (rm.materialsUsed && Array.isArray(rm.materialsUsed)) {
              if (!materials[existingIndex].materialsUsed) {
                materials[existingIndex].materialsUsed = [];
              }
              materials[existingIndex].materialsUsed.push(...rm.materialsUsed);
            }
          } else {
            // Add new material type
            materials.push(rm);
          }
        });
      }
    }
  }
  
  return materials;
}

// Get status with default value "pending"
getStatus(customer: any): string {
  let status: string = 'pending';
  
  // Check if Status is in the root level or in the latest revision
  if (customer?.Status) {
    status = customer.Status;
  } else {
    const latestRevision = this.getLatestRevision(customer);
    if (latestRevision?.Status) {
      status = latestRevision.Status;
    }
  }
  
  // Map "Completed" from server to "approved" for UI display
  if (status === 'Completed' || status === 'completed') {
    return 'approved';
  }
  
  return status;
}

// Get selected revision for a customer (or latest if none selected)
getSelectedRevision(customer: any): any {
  const customerId = customer._id;
  const revisionIndex = this.selectedRevisionForCustomer[customerId];
  const allRevisions = this.getAllRevisions(customer);
  
  if (revisionIndex !== undefined && revisionIndex >= 0 && revisionIndex < allRevisions.length) {
    return allRevisions[revisionIndex];
  }
  
  // Default to latest revision
  return this.getLatestRevision(customer) || null;
}

// Select a revision for a customer
selectRevisionForCustomer(customerId: string, revisionIndex: number): void {
  this.selectedRevisionForCustomer[customerId] = revisionIndex;
}

// Get selected revision index for a customer
getSelectedRevisionIndex(customer: any): number {
  const customerId = customer._id;
  const revisionIndex = this.selectedRevisionForCustomer[customerId];
  const allRevisions = this.getAllRevisions(customer);
  
  if (revisionIndex !== undefined && revisionIndex >= 0 && revisionIndex < allRevisions.length) {
    return revisionIndex;
  }
  
  // Default to latest (last index)
  return allRevisions.length > 0 ? allRevisions.length - 1 : -1;
}

// Toggle revision selection for comparison
toggleRevisionForComparison(customerId: string, revisionIndex: number): void {
  if (!this.selectedRevisionsForComparison[customerId]) {
    this.selectedRevisionsForComparison[customerId] = [];
  }
  
  const index = this.selectedRevisionsForComparison[customerId].indexOf(revisionIndex);
  if (index > -1) {
    this.selectedRevisionsForComparison[customerId].splice(index, 1);
  } else {
    this.selectedRevisionsForComparison[customerId].push(revisionIndex);
    this.selectedRevisionsForComparison[customerId].sort(); // Keep sorted
  }
}

// Check if revision is selected for comparison
isRevisionSelectedForComparison(customerId: string, revisionIndex: number): boolean {
  return this.selectedRevisionsForComparison[customerId]?.includes(revisionIndex) || false;
}

// Get count of selected revisions for comparison
getSelectedRevisionsCount(customerId: string): number {
  return this.selectedRevisionsForComparison[customerId]?.length || 0;
}

// Open compare dialog with selected revisions
openCompareWithSelectedRevisions(customer: any): void {
  const customerId = customer._id;
  const selectedIndices = this.selectedRevisionsForComparison[customerId] || [];
  
  if (selectedIndices.length < 2) {
    this.tooster.warning('Please select at least 2 revisions to compare', 'Warning');
    return;
  }
  
  // Get selected revision objects
  const allRevisions = this.getAllRevisions(customer);
  const selectedRevisions = selectedIndices.map(idx => allRevisions[idx]).filter(r => r !== undefined);
  
  // Create a modified customer object with only selected revisions
  const customerWithSelectedRevisions = {
    ...customer,
    revision: selectedRevisions
  };
  
  this.dialog.open(CompareRevisionsComponent, {
    width: '95%',
    maxWidth: '1400px',
    height: '85vh',
    data: { 
      customer: customerWithSelectedRevisions,
      preSelectedRevisions: selectedRevisions
    },
    autoFocus: false,
    disableClose: false
  });
}

// Build customer data object in the expected format for API
buildCustomerUpdateData(customer: any, newStatus: string): any {
  // Get CustomerName as string
  const customerName = customer?.CustomerName?.name || customer?.CustomerName || '';
  
  // Get processName array - check root level first, then revision
  let processNameArray: any[] = [];
  if (customer?.processName && Array.isArray(customer.processName) && customer.processName.length > 0) {
    processNameArray = customer.processName;
  } else {
    const latestRevision = this.getLatestRevision(customer);
    if (latestRevision?.processName && Array.isArray(latestRevision.processName) && latestRevision.processName.length > 0) {
      processNameArray = latestRevision.processName;
    }
  }

  // Get revision number - use revision array length or existing revision number
  let revisionNumber = 1;
  if (customer?.revision && Array.isArray(customer.revision)) {
    revisionNumber = customer.revision.length;
  } else if (customer?.revision && typeof customer.revision === 'number') {
    revisionNumber = customer.revision;
  }

  // Build the update data object in the expected format
  const updateData: any = {
    CustomerName: customerName,
    drawingNo: customer?.drawingNo || '',
    partName: customer?.partName || '',
    processName: processNameArray,
    Status: newStatus,
    revision: revisionNumber
  };

  return updateData;
}

// Handle status change
  onStatusChange(customerId: string, newStatus: string): void {
    const customer = this.customerDetails.find(c => c._id === customerId);
    
    if (!customer) {
      this.tooster.error('Customer not found', 'Error');
      return;
    }

    // Map "approved" from UI to "Completed" for server
    const serverStatus = newStatus === 'approved' ? 'Completed' : newStatus;

    // Build the complete customer data object in the expected format
    const updateData = this.buildCustomerUpdateData(customer, serverStatus);
    
    console.log('Updating customer with data:', updateData);

    const sub = this.reportsService.updateStatus(customerId, updateData).subscribe({
      next: (response) => {
        // Update the local customer data with server status (Completed)
        if (customer) {
          customer.Status = serverStatus;
          // Also update in revision if it exists
          const latestRevision = this.getLatestRevision(customer);
          if (latestRevision) {
            latestRevision.Status = serverStatus;
          }
        }
        this.tooster.success('Status updated successfully!', 'Success');
        this.groupCustomerData(); // Regroup after status update
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        console.error('Error details:', error.error);
        this.tooster.error('Failed to update status', 'Error');
        // Revert the change in UI by triggering change detection
        this.cdr.detectChanges();
      }
    });

    this.subscription.add(sub);
  }

  // Group customer data by customer name and partName
  groupCustomerData(): void {
    this.groupedCustomerData = {};
    this.groupedPartNameData = {};
    
    this.customerDetails.forEach(customer => {
      const customerName = customer.CustomerName?.name || 'Unknown';
      const partName = customer.partName || 'Unknown Part';
      
      // Group by customer
      if (!this.groupedCustomerData[customerName]) {
        this.groupedCustomerData[customerName] = [];
      }
      this.groupedCustomerData[customerName].push(customer);
      
      // Group by partName within customer
      if (!this.groupedPartNameData[customerName]) {
        this.groupedPartNameData[customerName] = {};
      }
      if (!this.groupedPartNameData[customerName][partName]) {
        this.groupedPartNameData[customerName][partName] = [];
      }
      this.groupedPartNameData[customerName][partName].push(customer);
    });
  }

  // Get list of customer names
  getCustomerNames(): string[] {
    return Object.keys(this.groupedCustomerData).sort();
  }

  // Get parts for a customer
  getCustomerParts(customerName: string): CustomerdetailsIn[] {
    return this.groupedCustomerData[customerName] || [];
  }

  // Get part count for a customer
  getPartCount(customerName: string): number {
    return this.getCustomerParts(customerName).length;
  }

  // Get partName groups for a customer
  getPartNameGroups(customerName: string): string[] {
    if (!this.groupedPartNameData[customerName]) {
      return [];
    }
    return Object.keys(this.groupedPartNameData[customerName]).sort();
  }

  // Get parts for a specific partName within a customer
  getPartsByPartName(customerName: string, partName: string): CustomerdetailsIn[] {
    if (!this.groupedPartNameData[customerName] || !this.groupedPartNameData[customerName][partName]) {
      return [];
    }
    return this.groupedPartNameData[customerName][partName];
  }

  // Get part count for a partName group
  getPartNameGroupCount(customerName: string, partName: string): number {
    return this.getPartsByPartName(customerName, partName).length;
  }

  // Check if partName group should be expandable (has more than 1 part)
  isPartNameGroupExpandable(customerName: string, partName: string): boolean {
    return this.getPartNameGroupCount(customerName, partName) > 1;
  }

  // Get unique key for partName group
  getPartNameGroupKey(customerName: string, partName: string): string {
    return `${customerName}_${partName}`;
  }

  // Toggle partName group expansion
  togglePartNameGroup(customerName: string, partName: string): void {
    const key = this.getPartNameGroupKey(customerName, partName);
    if (this.expandedPartNameGroups.has(key)) {
      this.expandedPartNameGroups.delete(key);
      // Also collapse all parts in this group
      const parts = this.getPartsByPartName(customerName, partName);
      parts.forEach(part => {
        this.expandedParts.delete(this.getPartKey(part));
      });
    } else {
      this.expandedPartNameGroups.add(key);
    }
  }

  // Check if partName group is expanded
  isPartNameGroupExpanded(customerName: string, partName: string): boolean {
    return this.expandedPartNameGroups.has(this.getPartNameGroupKey(customerName, partName));
  }

  // Get unique part identifier (drawingNo + partName)
  getPartKey(part: CustomerdetailsIn): string {
    return `${part.drawingNo || ''}_${part.partName || ''}_${part._id}`;
  }

  // Toggle customer expansion
  toggleCustomer(customerName: string): void {
    if (this.expandedCustomers.has(customerName)) {
      this.expandedCustomers.delete(customerName);
      // Also collapse all partName groups and parts for this customer
      const partNameGroups = this.getPartNameGroups(customerName);
      partNameGroups.forEach(partName => {
        this.expandedPartNameGroups.delete(this.getPartNameGroupKey(customerName, partName));
        const parts = this.getPartsByPartName(customerName, partName);
        parts.forEach(part => {
          this.expandedParts.delete(this.getPartKey(part));
        });
      });
    } else {
      this.expandedCustomers.add(customerName);
      // Optionally auto-expand all partName groups when customer is expanded
      // Uncomment the following lines if you want partName groups to auto-expand
      // const partNameGroups = this.getPartNameGroups(customerName);
      // partNameGroups.forEach(partName => {
      //   this.expandedPartNameGroups.add(this.getPartNameGroupKey(customerName, partName));
      // });
    }
  }

  // Check if customer is expanded
  isCustomerExpanded(customerName: string): boolean {
    return this.expandedCustomers.has(customerName);
  }

  // Toggle part expansion
  togglePart(part: CustomerdetailsIn): void {
    const partKey = this.getPartKey(part);
    if (this.expandedParts.has(partKey)) {
      this.expandedParts.delete(partKey);
    } else {
      this.expandedParts.add(partKey);
    }
  }

  // Check if part is expanded
  isPartExpanded(part: CustomerdetailsIn): boolean {
    return this.expandedParts.has(this.getPartKey(part));
  }

  // Switch view mode
  switchViewMode(mode: 'parts' | 'customers'): void {
    this.viewMode = mode;
  }

  onPartSelect(customerName: string, part: any, event: any) {
  // Set selected customer on first click
  if (!this.selectedCustomer) {
    this.selectedCustomer = customerName;
  }

  // If checkbox checked
  if (event.target.checked) {
    this.selectedParts.push(part);
  } else {
    this.selectedParts = this.selectedParts.filter(p => p._id !== part._id);

    // If no parts selected → unlock all customers
    if (this.selectedParts.length === 0) {
      this.selectedCustomer = null;
    }
  }

    this.pdfgenarate = this.selectedParts.length > 0;

  console.log("Selected Customer:", this.selectedCustomer);
  console.log("Selected Parts:", this.selectedParts);
}

openPdfPopup() {
  // Convert selectedParts → table rows
  this.tableUserInputs = this.selectedParts.map((p, index) => ({
    sno: index + 1,
    drawingNo: p.drawingNo || '-',
    partName: p.partName || '-',
    castingMaterial: '',
    castingWeight: '',
    annualVolume: '',
    partPrice: '',
    patternCost: '',
    moq: ''
  }));

  this.showPdfPopup = true;
}



addPoint(termIndex: number) {
  this.commercialTerms[termIndex].points.push("");
}

deletePoint(termIndex: number, pointIndex: number) {
  this.commercialTerms[termIndex].points.splice(pointIndex, 1);
}

addCommercialTerm() {
  this.commercialTerms.push({
    heading: '',
    points: ['']
  });
}

deleteTerm(index: number) {
  this.commercialTerms.splice(index, 1);
}

addTerm() {
  this.termsAndConditions.push('');
}

removeTerm(index: number) {
  this.termsAndConditions.splice(index, 1);
}

logTable() {
  console.log("Selected Parts Table:", this.tableUserInputs);
  console.log("Material Composition:", this.materialComposition);
  console.log("Attention:", this.attention);
  console.log("Regards:", this.regards);
  console.log("General Terms:", this.termsAndConditions); 
  console.log("Commercial Terms:", this.commercialTerms);
  this.pdfgenarate = false;
}

trackByIndex(index: number, item: any) {
  return index;
}




cosepopup(){
  this.showPdfPopup = false;
}


}
