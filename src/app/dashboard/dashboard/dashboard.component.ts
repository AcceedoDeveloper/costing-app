import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service'; 
import {loadCustomerDetails } from '../../material/store/material.actions';
import { getCustomerDetails} from '../../material/store/material.selector';
import { CustomerdetailsIn } from '../../models/Customer-details.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    chart : any;
    barChart:any;
    materilachart:any;
    customersList: any[] = [];
    recentUpdates: any[] = [];
    ActualEstimationCost: any[] = [];
    customerDetails : CustomerdetailsIn[] = [];
    pendingQuotations: CustomerdetailsIn[] = [];
  completedQuotations: CustomerdetailsIn[] = [];
  selectedCustomerDetails$: Observable<any>;
  chartType = 'ColumnChart';
  chartData: any[] = [];
  selectedDate: Date = new Date();


  paginatedData: any[] = [];
currentPage: number = 1;
itemsPerPage: number = 5;
totalPages: number = 1;
startDate!: Date;
endDate!: Date;
actualEstimationCost: any[] = [];
filteredEstimationCost: any[] = [];

estimationStartDate!: Date | null;
estimationEndDate!: Date | null;
searchTerm: string = '';

filteredPendingQuotations: CustomerdetailsIn[] = [];
filteredCompletedQuotations: CustomerdetailsIn[] = [];
  monthLabels: string[] = [];

dataSource = new MatTableDataSource<any>();
displayedColumns: string[] = ['CustomerName', 'partName', 'TotalProcessCost', 'actualCost', 'difference'];

@ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(private dashboardServices: DashboardService, private store : Store) { }

chartColumns = ['Material', 'May', 'June', 'July']; 

chartOptions = {
  legend: { position: 'none' },
  bar: { groupWidth: '60%' },
  colors: ['#e74c3c', '#f39c12', '#3498db'], // Red, Orange, Blue
  hAxis: {
    title: 'Material',
    textStyle: { fontSize: 12 }
  },
  vAxis: {
    title: 'Unit Cost',
    minValue: 0,
    textStyle: { fontSize: 12 }
  },
  tooltip: { trigger: 'focus' }, // Show on click/focus, not hover
  animation: {
    duration: 500,
    easing: 'out',
    startup: true
  }
};




ngOnInit(): void {


    



  

   const today = new Date();
const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
this.estimationStartDate = sixMonthsAgo;
this.estimationEndDate = today;

     this.onSingleDateChange(this.selectedDate);

  this.startDate = sixMonthsAgo;
  this.endDate = today;
  this.fetchActualEstimationCost();

  this.fetchMaterialGraphData();

this.fetchActualEstimationCost();
  
  this.fetchRecentUpdatedData(this.selectedDate);
   this.store.dispatch(loadCustomerDetails());

  this.selectedCustomerDetails$ = this.store.select(getCustomerDetails); 

  this.selectedCustomerDetails$.subscribe(data => {
    this.customerDetails = data;
    this.pendingQuotations = data.filter(item => item.Status?.toLowerCase() === 'pending');
    this.completedQuotations = data.filter(item => item.Status?.toLowerCase() === 'completed');

    // Initialize filtered arrays
    this.filteredPendingQuotations = [...this.pendingQuotations];
    this.filteredCompletedQuotations = [...this.completedQuotations];

    this.filterQuotations();
  });


let fullCostHistory: any[] = [];

this.dashboardServices.getdata().subscribe((res) => {
  console.log('power data', res);
  const powerCostMap = res.powerCostMap?.[0];
  const previousCosts = powerCostMap?.previousCostDetails || [];

  if (powerCostMap?.costPerUnit && powerCostMap?.effectiveDate) {
    const exists = previousCosts.some(
      (entry: any) => entry.date === powerCostMap.effectiveDate
    );
    if (!exists) {
      previousCosts.push({
        cost: powerCostMap.costPerUnit,
        date: powerCostMap.effectiveDate
      });
    }
  }

  const formattedData = previousCosts.map((entry: any) => {
    let formattedDate = entry.date;
    if (formattedDate.includes('T')) {
      const d = new Date(formattedDate);
      formattedDate = `${String(d.getDate()).padStart(2, '0')}-${String(
        d.getMonth() + 1
      ).padStart(2, '0')}-${d.getFullYear()}`;
    }

    const [day, month, year] = formattedDate.split('-');
    return {
      cost: entry.cost,
      date: new Date(+year, +month - 1, +day)
    };
  });

  formattedData.sort((a, b) => a.date.getTime() - b.date.getTime());
  const chartData = formattedData.map(m => [m.date, m.cost]);

  this.chart = {
    type: 'LineChart',
    data: chartData,
    columnNames: ['Date', 'Power Cost (₹)'],
    options: {
      title: 'Power Cost Over Time',
      hAxis: {
        title: 'Date',
        format: 'MMM dd', // Example: Jul 24
        gridlines: { count: 6 }, // Show fewer X-axis gridlines/labels
        slantedText: true,
        slantedTextAngle: 45,
        showTextEvery: 2, // Show every 2nd label only
      },
      vAxis: {
        title: 'Cost (₹)',
        minValue: 0
      },
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 4.0
      },
      legend: 'none',
      colors: ['#4CAF50'],
      pointSize: 6,
      lineWidth: 2
    },
    width: '100%',
    height: '400'
  };
});












 

}


fetchRecentUpdatedData(date: Date): void {
  
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1); 

  const formatDate = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const yearNo = startDate.getFullYear();

  this.dashboardServices.getResentUpdatedData(yearNo, formattedStartDate, formattedEndDate).subscribe({
    next: (res) => {
      const dateField = 'updatedAt';

      this.recentUpdates = (res.data || []).filter(item => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        return formatDate(itemDate) === formattedStartDate;
      });
    },
    error: (err) => {
      console.error('API error:', err);
      this.recentUpdates = [];
    }
  });
}
changeDate(days: number): void {
  const newDate = new Date(this.selectedDate);
  newDate.setDate(newDate.getDate() + days);
  this.selectedDate = newDate;
  this.fetchRecentUpdatedData(this.selectedDate);
}
















onSearch(event: any): void {
  const value = event.target.value.trim().toLowerCase();
  this.dataSource.filter = value;
}

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
}










fetchMaterialGraphData() {
  const start = this.formatDate(this.startDate);
  const end = this.formatDate(this.endDate);

  this.dashboardServices.materialGraphData(start, end).subscribe((res) => {
    const materialMap: {
      [key: string]: { name: string; priceHistory: { date: string; unitCost: number }[] }
    } = {};

    Object.keys(res.data).forEach(category => {
      const materials = res.data[category];

      materials.forEach((material: any) => {
        const name = material.name;
        if (!materialMap[name]) {
          materialMap[name] = { name, priceHistory: [] };
        }

        material.priceHistory.forEach((entry: any) => {
          materialMap[name].priceHistory.push({
            date: entry.date,
            unitCost: entry.unitCost
          });
        });
      });
    });

    const resultArray = Object.values(materialMap);

    const sorted = resultArray.sort((a, b) => {
      const latestA = a.priceHistory[a.priceHistory.length - 1]?.unitCost || 0;
      const latestB = b.priceHistory[b.priceHistory.length - 1]?.unitCost || 0;
      return latestB - latestA;
    });

    const top3 = sorted.slice(0, 3);

    // ✅ Generate last 3 months based on "endDate"
    const baseDate = new Date(this.endDate || new Date());
    const months = [...Array(3)].map((_, i) => {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - 2 + i, 1);
      return {
        label: d.toLocaleString('default', { month: 'short' }), // e.g., Jun
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // e.g., 2025-07
      };
    });

    this.monthLabels = months.map(m => m.label); // ✅ For heading

    this.chartColumns = ['Material', ...this.monthLabels];

    this.chartData = top3.map(material => {
      const row: (string | number)[] = [material.name];
      months.forEach(month => {
        const found = material.priceHistory.find(entry =>
          entry.date.substring(0, 7) === month.key
        );
        row.push(found ? found.unitCost : 0);
      });
      return row;
    });


  });
}

// Helper
formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}
onDateChange() {
  if (this.startDate && this.endDate) {
    this.fetchMaterialGraphData();
  }
}


fetchActualEstimationCost() {
  const start = this.formatDate(this.estimationStartDate!);
  const endDateWithOneDay = new Date(this.estimationEndDate!);
  endDateWithOneDay.setDate(endDateWithOneDay.getDate() + 1);
  const end = this.formatDate(endDateWithOneDay);

  this.dashboardServices.ActualEstimationCost(start, end).subscribe((res) => {
    this.actualEstimationCost = res.data;
    this.filteredEstimationCost = res.data;

    this.dataSource = new MatTableDataSource(this.filteredEstimationCost);

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    console.log('Actual Estimation Cost Data:', this.actualEstimationCost);
  });
}




onEstimationRangeChange() {
  if (this.estimationStartDate && this.estimationEndDate) {
    this.fetchActualEstimationCost();
  }
}


filterQuotations(): void {
  const term = this.searchTerm.toLowerCase();
  this.filteredPendingQuotations = this.pendingQuotations.filter(item =>
    item.CustomerName?.name.toLowerCase().includes(term)
  );
  this.filteredCompletedQuotations = this.completedQuotations.filter(item =>
    item.CustomerName?.name.toLowerCase().includes(term)
  );
}


 onSingleDateChange(selected: Date): void {
  if (!selected) return;

  // Set the selected month (1st of selected month)
  this.endDate = new Date(selected.getFullYear(), selected.getMonth(), 1);

  // Go back 2 months and set it to 1st of that month
  this.startDate = new Date(selected.getFullYear(), selected.getMonth() - 2, 1);

  this.fetchMaterialGraphData();
}

}
