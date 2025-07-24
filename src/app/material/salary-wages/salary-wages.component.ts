
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { SalaryEntry } from '../../models/SalaryMapResponse.model';
import { loadSalaryMap, updateSalaryEntry } from '../store/material.actions';
import { getsalaryMap } from '../store/material.selector';
import { AddSalaryWagesComponent } from './add-salary-wages/add-salary-wages.component';

@Component({
  selector: 'app-salary-wages',
  templateUrl: './salary-wages.component.html',
  styleUrls: ['./salary-wages.component.css']
})
export class SalaryWagesComponent implements OnInit {
  salaryMapData$: Observable<SalaryEntry[]>;
  salaryMapRawData: SalaryEntry[] = [];
  filteredData: any[] = [];
  pagedSalaryTable: any[] = [];
  searchTerm: string = '';
  editingRow: string | null = null;
  currentMonth: string = new Date().toLocaleString('default', { month: 'long' });
  backupRow: any = null;
  startDate!: Date;
  endDate!: Date;



  tableHeaders: string[] = ['May', 'June', 'July'];
  reversedTableHeaders: string[] = ['July', 'June', 'May'];
  salaryTable: { processName: string; [month: string]: any }[] = [];

  pageSize = 3;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
      this.autoLoadSalaryMap();
    this.salaryMapData$ = this.store.select(getsalaryMap);

    this.salaryMapData$.subscribe((data: SalaryEntry[] | null | undefined) => {
      if (!data) return;
      this.salaryMapRawData = data;

      const processMap = new Map<string, { processName: string; [month: string]: any }>();

      data.forEach(entry => {
        const processName = entry.processName;
        const entryMonth = this.formatMonth(entry.date);

        if (!this.tableHeaders.includes(entryMonth)) return;

        if (!processMap.has(processName)) {
          const emptyRow: any = { processName };
          this.tableHeaders.forEach(month => (emptyRow[month] = null));
          processMap.set(processName, emptyRow);
        }

        const row = processMap.get(processName)!;
        row[entryMonth] = this.extractSalaryData(entry);
      });

      this.salaryTable = Array.from(processMap.values()).map(row => {
        this.tableHeaders.forEach(month => {
          if (!(month in row)) row[month] = null;
        });
        return row;
      });

      this.applyFilter();
    });
  }

  formatMonth(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('default', { month: 'long' });
  }

  extractSalaryData(entry: any) {
    return {
      salaryforProcess: entry.salaryforProcess,
      salaryExcludingCoreMaking: entry.salaryExcludingCoreMaking,
      salaryForCoreProduction: entry.salaryForCoreProduction,
      outSourcingCost: entry.outSourcingCost,
      splOutSourcingCost: entry.splOutSourcingCost,
      TotalOutSourcingCost: entry.TotalOutSourcingCost
    };
  }

  addSalarywages(): void {
    const dialogRef = this.dialog.open(AddSalaryWagesComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(() => {
    });
  }


  applyFilter(): void {
    const search = this.searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredData = [...this.salaryTable];
    } else {
      this.filteredData = this.salaryTable.filter(row =>
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
    this.pagedSalaryTable = this.filteredData.slice(start, end);
  }

  editSalaryWagesFull(processName: string): void {
  this.editingRow = processName;

  const match = this.salaryTable.find(row => row.processName === processName);
  if (match) {
    // Store a deep copy for cancel
    this.backupRow = JSON.parse(JSON.stringify(match));
  }

  // Set current month for editing (optional: default to latest header)
  this.currentMonth = this.reversedTableHeaders[0]; // e.g., 'July'
}


saveSalaryWages(): void {
  const updatedRow = this.salaryTable.find(row => row.processName === this.editingRow);
  const originalRow = this.salaryMapRawData.find(row => row.processName === this.editingRow);

  if (!updatedRow || !originalRow) return;

  const monthData = updatedRow[this.currentMonth];
  if (!monthData) {
    console.warn(`⚠️ No data found for ${this.currentMonth}`);
    return;
  }

  const payload = {
    processName: updatedRow.processName,
    salaryforProcess: monthData.salaryforProcess,
    salaryExcludingCoreMaking: monthData.salaryExcludingCoreMaking,
    salaryForCoreProduction: monthData.salaryForCoreProduction,
    outSourcingCost: monthData.outSourcingCost,
    splOutSourcingCost: monthData.splOutSourcingCost
  };

  console.log("📦 Updating with payload:", payload);
  this.store.dispatch(updateSalaryEntry({ id: originalRow._id, payload }));
  

  this.editingRow = null;
  this.backupRow = null;
}

cancelEdit(): void {
  if (this.backupRow) {
    const index = this.salaryTable.findIndex(row => row.processName === this.backupRow.processName);
    if (index !== -1) {
      this.salaryTable[index] = JSON.parse(JSON.stringify(this.backupRow));
    }
  }

  this.editingRow = null;
  this.backupRow = null;
}

onDateRangeChange(): void {
  if (!this.startDate || !this.endDate) return;

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  const startDateStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;

  // Get last day of end month
  const endDateStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}`;

  const yearNo = start.getFullYear();

  console.log("📅 Filtering SalaryMap by range:", { startDateStr, endDateStr, yearNo });

  this.store.dispatch(loadSalaryMap({ startDate: startDateStr, endDate: endDateStr, yearNo }));
}

autoLoadSalaryMap(): void {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  const yearNo = today.getFullYear();

  this.store.dispatch(loadSalaryMap({ startDate: startDateStr, endDate: endDateStr, yearNo }));
}

}
