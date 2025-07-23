
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { Overheads } from '../../../models/over-head.model';
import { loadOverheads } from '../store/master.action';
import { getoverheads } from '../store/master.selector';
import { AddOverheadsComponent } from './add-overheads/add-overheads.component';

@Component({
  selector: 'app-over-heads',
  templateUrl: './over-heads.component.html',
  styleUrls: ['./over-heads.component.css']
})
export class OverHeadsComponent implements OnInit {
  powerCostData$: Observable<Overheads[]>;
  overheadRawData: Overheads[] = [];
  filteredData: any[] = [];
  pagedOverheadTable: any[] = [];
  searchTerm: string = '';
  startDate!: Date;
  endDate!: Date;



  tableHeaders: string[] = ['May 2025', 'June 2025', 'July 2025'];
  reversedTableHeaders: string[] = ['July 2025', 'June 2025', 'May 2025'];
  overheadTable: { processName: string; [month: string]: any }[] = [];

  pageSize = 3;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.autoLoadOverheads();
    this.powerCostData$ = this.store.select(getoverheads);

    this.powerCostData$.subscribe((data: Overheads[] | null | undefined) => {
      if (!data) return;
      this.overheadRawData = data;

      const processMap = new Map<string, { processName: string; [month: string]: any }>();

      data.forEach(entry => {
        const processName = entry.processName;
        const currentMonth = this.formatMonthYear(entry.date);

        if (!processMap.has(processName)) {
          const emptyRow: any = { processName };
          this.tableHeaders.forEach(month => emptyRow[month] = null);
          processMap.set(processName, emptyRow);
        }

        const row = processMap.get(processName)!;

        if (this.tableHeaders.includes(currentMonth)) {
          row[currentMonth] = this.extractOverheadData(entry);
        }

        if (entry.previousOverheadsDetails && Array.isArray(entry.previousOverheadsDetails)) {
          entry.previousOverheadsDetails.forEach(prev => {
            const prevMonth = this.formatMonthYear(prev.date);
            if (this.tableHeaders.includes(prevMonth)) {
              row[prevMonth] = this.extractOverheadData(prev);
            }
          });
        }
      });

      this.overheadTable = Array.from(processMap.values()).map(row => {
        this.tableHeaders.forEach(month => {
          if (!(month in row)) row[month] = null;
        });
        return row;
      });

      this.applyFilter();
    });
  }

  formatMonthYear(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  extractOverheadData(entry: any) {
    return {
      repairAndMaintenance: entry.repairAndMaintenance,
      sellingDistributionAndMiscOverHeads: entry.sellingDistributionAndMiscOverHeads,
      financeCost: entry.financeCost,
      totalOverHeads: entry.totalOverHeads,
      totalOverHeadsWithFinanceCost: entry.totalOverHeadsWithFinanceCost,
    };
  }

  openAddOverheads() {
    this.dialog.open(AddOverheadsComponent, {
      width: '500px'
    });
  }

  editOverheads(processName: string) {
    const match = this.overheadRawData.find(entry => entry.processName === processName);
    if (match) {
      this.dialog.open(AddOverheadsComponent, {
        width: '500px',
        data: match
      });
    }
  }

  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredData = [...this.overheadTable];
    } else {
      this.filteredData = this.overheadTable.filter(row =>
        row.processName.toLowerCase().includes(search)
      );
    }

    this.pageIndex = 0;
    this.paginate();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.paginate();
  }

  paginate() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedOverheadTable = this.filteredData.slice(start, end);
  }


  autoLoadOverheads() {
  const currentDate = new Date();

  // First day of current month
  const endDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Last day of current month
  const endDate = new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 0); // last day of current month

  // First day of two months ago
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1);

  // Format dates to YYYY-MM-DD
  const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
  const yearNo = startDate.getFullYear();

  console.log("✅ API: ", `http://localhost:3005/getOverheadsMap?yearNo=${yearNo}&startDate=${startDateStr}&endDate=${endDateStr}`);

  // Dispatch the API call
  this.store.dispatch(loadOverheads({ startDate: startDateStr, endDate: endDateStr, yearNo }));
}



onDateRangeChange() {
  if (!this.startDate || !this.endDate) return;

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  const startDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;

  // Last day of end month
  const endDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}`;

  const yearNo = start.getFullYear();

  console.log("📦 Dispatching with:", { startDateStr, endDateStr, yearNo });

  this.store.dispatch(loadOverheads({ startDate: startDateStr, endDate: endDateStr, yearNo }));
}


}

