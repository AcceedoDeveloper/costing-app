import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { SalaryEntry } from '../../models/SalaryMapResponse.model';
import { loadSalaryMap, updateSalaryEntry } from '../store/material.actions';
import { getsalaryMap } from '../store/material.selector';
import { AddSalaryWagesComponent } from './add-salary-wages/add-salary-wages.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-salary-wages',
  templateUrl: './salary-wages.component.html',
  styleUrls: ['./salary-wages.component.css']
})
export class SalaryWagesComponent implements OnInit {
  salaryMapData$: Observable<SalaryEntry[]>;
  salaryMapRawData: SalaryEntry[] = [];
  formattedSalaryTableData: any[] = [];

  searchTerm: string = '';
  editingRow: string | null = null;
  currentMonth: string = '';
  backupRow: any = null;

  tableHeaders: string[] = [];
  reversedTableHeaders: string[] = [];

  filteredData: any[] = [];
pagedSalaryTable: any[] = [];


  pageSize = 3;
  pageIndex = 0;
  defaultMonth: Date = new Date();

  monthYearControl = new FormControl();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.applyFilter();

    const today = new Date();
    this.currentMonth = this.formatMonthYear(today);
    this.setMonthHeaders(today);
    this.autoLoadSalaryMap();

    this.salaryMapData$ = this.store.select(getsalaryMap);

   this.salaryMapData$.subscribe((data: SalaryEntry[] | null | undefined) => {
  if (!data) return;

  this.salaryMapRawData = data;
  console.log('salaryMapRawData:', this.salaryMapRawData);

  this.formattedSalaryTableData = [];

  const groupedMap = new Map<string, SalaryEntry[]>();
  data.forEach(entry => {
    if (!groupedMap.has(entry.processName)) {
      groupedMap.set(entry.processName, []);
    }
    groupedMap.get(entry.processName)?.push(entry);
  });

  groupedMap.forEach((entries, processName) => {
    const row: any = { processName };

    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  entries.forEach(entry => {
  const allEntries = [entry, ...(entry.previousSalaryWagesDetails || [])];

  allEntries.forEach(subEntry => {
    const month = this.formatMonthYear(subEntry.date);
    if (!this.tableHeaders.includes(month)) return;

    row[month] = {
      salaryforProcess: subEntry.salaryforProcess ?? entry.salaryforProcess,
      salaryExcludingCoreMaking: subEntry.salaryExcludingCoreMaking ?? entry.salaryExcludingCoreMaking,
      salaryForCoreProduction: subEntry.salaryForCoreProduction ?? entry.salaryForCoreProduction,
      outSourcingCost: subEntry.outSourcingCost,
      splOutSourcingCost: subEntry.splOutSourcingCost,
      TotalOutSourcingCost: subEntry.TotalOutSourcingCost
    };
  });
});


    this.formattedSalaryTableData.push(row);
  });

  this.applyFilter(); // Important: triggers pagination
});

  }

  formatMonthYear(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  setMonthHeaders(baseDate: Date) {
    const headers: string[] = [];
    for (let i = -2; i <= 0; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      headers.push(this.formatMonthYear(date));
    }
    this.tableHeaders = headers;
    this.reversedTableHeaders = [...headers].reverse();
  }

autoLoadSalaryMap(): void {
  const selectedDate = this.monthYearControl.value || new Date();
  const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 2, 1);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  const yearNo = selectedDate.getFullYear();

  this.store.dispatch(loadSalaryMap({ startDate: startDateStr, endDate: endDateStr, yearNo }));
}


  openAddSalaryWages(): void {
    this.dialog.open(AddSalaryWagesComponent, { width: '500px' });
  }

  startEditing(processName: string) {
    this.editingRow = processName;
  }

  cancelEdit() {
    this.editingRow = null;
  }

  saveFormattedRow(row: any) {
  const month = this.currentMonth;
  const currentMonthData = row[month];
  if (!currentMonthData) return;

  const matchingEntry = this.salaryMapRawData.find(entry =>
    entry.processName === row.processName
  );
  if (!matchingEntry) return;

  const payload = {
    processName: row.processName,
    salaryforProcess: currentMonthData.salaryforProcess,
    salaryExcludingCoreMaking: currentMonthData.salaryExcludingCoreMaking,
    salaryForCoreProduction: currentMonthData.salaryForCoreProduction,
    outSourcingCost: currentMonthData.outSourcingCost,
    splOutSourcingCost: currentMonthData.splOutSourcingCost
  };

  console.log('Saving formatted row:', payload);
  this.store.dispatch(updateSalaryEntry({ id: matchingEntry._id, payload }));
  this.editingRow = null;
}

  applyFilter() {
  if (!this.searchTerm) {
    this.filteredData = [...this.formattedSalaryTableData];
  } else {
    this.filteredData = this.formattedSalaryTableData.filter(row =>
      row.processName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  this.pageIndex = 0;
  this.updatePagedData();
}

updatePagedData() {
  const startIndex = this.pageIndex * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.pagedSalaryTable = this.filteredData.slice(startIndex, endIndex);
}

onPageChange(event: PageEvent) {
  this.pageIndex = event.pageIndex;
  this.pageSize = event.pageSize;
  this.updatePagedData();
}

addSalarywages(): void {
    const dialogRef = this.dialog.open(AddSalaryWagesComponent, { width: '500px' });
    dialogRef.afterClosed().subscribe(() => {});
  }

  setMonthAndYear(normalizedMonth: Date, datepicker: any): void {
    const ctrlValue = this.monthYearControl.value || new Date();
    ctrlValue.setMonth(normalizedMonth.getMonth());
    ctrlValue.setFullYear(normalizedMonth.getFullYear());
    this.monthYearControl.setValue(new Date(ctrlValue));
    this.setMonthHeaders(new Date(ctrlValue));
    this.autoLoadSalaryMap(); // reload data
    datepicker.close();
  }

  // ✅ Fix for error 3
  chosenYearHandler(normalizedYear: Date): void {
    const ctrlValue = this.monthYearControl.value || new Date();
    ctrlValue.setFullYear(normalizedYear.getFullYear());
    this.monthYearControl.setValue(new Date(ctrlValue));
  }


  editSalaryWagesFull(processName: string) {
  console.log('Editing process:', processName);
  this.editingRow = processName;
}


}
