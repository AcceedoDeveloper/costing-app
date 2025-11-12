import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService } from '../../services/dashboard.service';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DifferenceGraphDialogComponent } from './difference-graph-dialog.component';



interface Quotation {
  customer: string;
  email: string;
  partName: string;
  status: string;
  sentAt: string;
  actualCost: number;
  difference: number;
}

interface GradeLegendItem {
  label: string;
  value: string;
  percent: number;
  color: string;
}

interface RecentUpdate {
  name: string;
  initials: string;
  message: string;
}

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit, AfterViewInit {


  constructor(
    private dashboardServices: DashboardService,
    private dialog: MatDialog
  ) { }
  actualEstimationCost: any[] = [];
  filteredEstimationCost: any[] = [];
  estimationStartDate!: Date | null;
  estimationEndDate!: Date | null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();

  // Quotations Table
  displayedColumns: string[] = ['customer', 'email', 'partName', 'status', 'sentAt', 'actualCost', 'difference'];
  quotationsDataSource = new MatTableDataSource<any>([]);
  selectedDate: Date = new Date(); // Will be set to current date in ngOnInit
  pageSize = 5;

  // Total Quotations Summary
  totalQuotations = 64;
  pendingCount = 8;
  approvedCount = 12;
  rejectedCount = 14;
  pendingPercent = 24;
  approvedPercent = 35;
  rejectedPercent = 41;

  // Grade View
  selectedGrade = 'All';
  grades = ['All', 'SGI-NIL Cu', 'SGI-HIGH Cu', 'SGI-LOW Cu', 'GCI'];
  gradeChart: any;
  gradeLegend: GradeLegendItem[] = [];

  // Cost Chart
  costChart: any;
  actualCost = 4500;
  currentCost = 4000;
  difference = 500;

  // Part Details
  partName = '';
  drawingNo = 223;
  customerName = 'Sv Industries';
  quoteAt = '08/11/2024';

  // Recent Updates
  recentUpdates: RecentUpdate[] = [
    { name: 'Karthik', initials: 'EK', message: 'Updated in Material' },
    { name: 'Prabha', initials: 'JH', message: 'Updated in Grade' },
    { name: 'Prabha', initials: 'AF', message: 'Updated in Grade' }
  ];

  ngOnInit(): void {
    // Initialize date range for current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.estimationStartDate = firstDayOfMonth;
    this.estimationEndDate = today;
    this.selectedDate = today; // Set date picker to current date

    this.initializeQuotations();
    this.initializeGradeChart();
    this.initializeCostChart();
    this.fetchActualEstimationCost();
  }

  initializeQuotations(): void {
    // Data will be loaded from API in fetchActualEstimationCost
    // Keep empty initially, will be populated after API call
    this.quotationsDataSource.data = [];
  }

  initializeGradeChart(): void {
    const total = 17498;
    const data = [
      ['SGI-NIL Cu', 6999],
      ['SGI-HIGH Cu', 4900],
      ['SGI-LOW Cu', 3150],
      ['GCI', 2449]
    ];

    this.gradeChart = {
      type: 'PieChart',
      data: [['Grade', 'Value'], ...data],
      options: {
        pieHole: 0.6,
        pieSliceText: 'none',
        legend: 'none',
        colors: ['#1e40af', '#a855f7', '#94a3b8', '#475569'],
        chartArea: { left: 20, top: 20, width: '80%', height: '80%' },
        tooltip: {
          textStyle: { fontSize: 14 }
        }
      },
      width: '100%',
      height: 400
    };

    this.gradeLegend = [
      { label: 'SGI-NIL Cu', value: '6.999', percent: 40, color: '#1e40af' },
      { label: 'SGI-HIGH Cu', value: '4.900', percent: 28, color: '#a855f7' },
      { label: 'SGI-LOW Cu', value: '3,150', percent: 18, color: '#94a3b8' },
      { label: 'GCI', value: '2.449', percent: 14, color: '#475569' }
    ];
  }

  initializeCostChart(): void {
    this.costChart = {
      type: 'BarChart',
      data: [
        ['Portfolio', 'OCF', 'Transaction costs'],
        ['Demofolio 50', 0.15, 0.05],
        ['Demofolio 100', 0.25, 0.05]
      ],
      options: {
        isStacked: true,
        legend: 'none',
        colors: ['#a855f7', '#14b8a6'],
        hAxis: {
          title: 'Portfolio',
          textStyle: { fontSize: 12 }
        },
        vAxis: {
          title: 'Cost (%)',
          minValue: 0,
          maxValue: 0.30,
          format: '#%',
          textStyle: { fontSize: 12 }
        },
        chartArea: { left: 80, top: 20, width: '70%', height: '70%' },
        bar: { groupWidth: '60%' }
      },
      width: '100%',
      height: 300
    };
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'rejected') return 'status-rejected';
    return 'status-pending';
  }

  getDateInputValue(): string {
    // Convert Date to YYYY-MM-DD format for HTML date input
    if (!this.selectedDate) return '';
    const date = new Date(this.selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateInputChange(event: any): void {
    const selectedDateString = event.target.value;
    if (selectedDateString) {
      this.selectedDate = new Date(selectedDateString);
      this.onDateChange();
    }
  }

  onDateChange(): void {
    // When date picker changes, update the date range to the selected month
    if (this.selectedDate) {
      const selectedDate = new Date(this.selectedDate);
      const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      // If selected date is in the current month, use today as end date
      const today = new Date();
      const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && 
                            selectedDate.getFullYear() === today.getFullYear();
      
      this.estimationStartDate = firstDayOfMonth;
      this.estimationEndDate = isCurrentMonth ? today : lastDayOfMonth;
      
      // Fetch data for the selected month
      this.fetchActualEstimationCost();
    }
  }

  onGradeChange(): void {
    // Handle grade change logic
    console.log('Grade changed:', this.selectedGrade);
  }


  ngAfterViewInit(): void {
    if (this.paginator) {
      this.quotationsDataSource.paginator = this.paginator;
    }
  }

  formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }


  fetchActualEstimationCost() {
    if (!this.estimationStartDate || !this.estimationEndDate) {
      console.warn('Date range not initialized');
      return;
    }

    const start = this.formatDate(this.estimationStartDate);
    const endDateWithOneDay = new Date(this.estimationEndDate);
    endDateWithOneDay.setDate(endDateWithOneDay.getDate() + 1);
    const end = this.formatDate(endDateWithOneDay);
  
    this.dashboardServices.ActualEstimationCost(start, end).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.actualEstimationCost = res.data;
          this.filteredEstimationCost = res.data;
    
          // Map API data to quotations table format
          const mappedQuotations = this.mapApiDataToQuotations(res.data);
          this.quotationsDataSource.data = mappedQuotations;
          
          // Update summary counts
          this.updateSummaryCounts(mappedQuotations);
    
          // Also set dataSource for compatibility
          this.dataSource = new MatTableDataSource(this.filteredEstimationCost);
    
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.quotationsDataSource.paginator = this.paginator;
          }
    
          console.log('Actual Estimation Cost Data:', this.actualEstimationCost);
        } else {
          console.warn('No data received from API');
          this.quotationsDataSource.data = [];
        }
      },
      error: (error) => {
        console.error('Error fetching actual estimation cost:', error);
        // Set empty data to prevent white screen
        this.quotationsDataSource.data = [];
        this.actualEstimationCost = [];
        this.filteredEstimationCost = [];
      }
    });
  }

  mapApiDataToQuotations(apiData: any[]): any[] {
    return apiData.map(item => {
      const customerName = item.CustomerName?.name || 'N/A';
      const email = item.CustomerName?.phoneNo || item.CustomerName?.email || 'N/A';
      const sentAt = item.updatedAt ? this.formatDisplayDate(item.updatedAt) : 'N/A';
      const actualCost = parseFloat(item.actualCost) || 0;
      const difference = parseFloat(item.difference) || 0;
      
      // Set all status as Pending for now - can be updated in future
      const status = 'Pending';

      return {
        customer: customerName,
        email: email,
        partName: item.partName || 'N/A',
        status: status,
        sentAt: sentAt,
        actualCost: actualCost,
        difference: difference, // Keep original difference (can be positive or negative)
        differenceAbs: Math.abs(difference), // Absolute value for display
        // Keep original data for reference
        originalData: item
      };
    });
  }

  formatDisplayDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  }

  updateSummaryCounts(quotations: any[]): void {
    this.totalQuotations = quotations.length;
    this.pendingCount = quotations.filter(q => q.status === 'Pending').length;
    this.approvedCount = quotations.filter(q => q.status === 'Approved').length;
    this.rejectedCount = quotations.filter(q => q.status === 'Rejected').length;
    
    if (this.totalQuotations > 0) {
      this.pendingPercent = Math.round((this.pendingCount / this.totalQuotations) * 100);
      this.approvedPercent = Math.round((this.approvedCount / this.totalQuotations) * 100);
      this.rejectedPercent = Math.round((this.rejectedCount / this.totalQuotations) * 100);
    }
  }

  openDifferenceGraph(row: any): void {
    try {
      // Get the original data from the row
      const itemData = row.originalData || row;
      
      console.log('Opening graph for item:', itemData);
      
      const dialogRef = this.dialog.open(DifferenceGraphDialogComponent, {
        width: '1000px',
        maxWidth: '95vw',
        data: {
          item: itemData,
          allData: this.actualEstimationCost
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('Difference graph dialog closed');
      });
    } catch (error) {
      console.error('Error opening difference graph:', error);
    }
  }
}
