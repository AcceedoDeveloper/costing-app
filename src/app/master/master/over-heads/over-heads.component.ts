import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { Overheads } from '../../../models/over-head.model';
import { loadOverheads, updateOverhead } from '../store/master.action';
import { getoverheads } from '../store/master.selector';
import { AddOverheadsComponent } from './add-overheads/add-overheads.component';
import * as dayjs from 'dayjs';


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
  editingRow: string | null = null;
  currentMonth: string = '';
  backupRow: any = null;
  formattedOverheadTableData: any[] = [];


  tableHeaders: string[] = [];
  reversedTableHeaders: string[] = [];
  overheadTable: { processName: string; [month: string]: any }[] = [];

  pageSize = 3;
  pageIndex = 0;

  selectedMonthYear = new FormControl(new Date());

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.currentMonth = this.formatMonthYear(currentDate);
    this.setMonthHeaders(currentDate);

    this.loadOverheadsForMonth(currentDate);

    this.powerCostData$ = this.store.select(getoverheads);

    
this.powerCostData$.subscribe((data: Overheads[] | null | undefined) => {
  if (!data) return;
  this.overheadRawData = data;
  console.log('Overhead Raw Data:', this.overheadRawData);
  

  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthYear = `${monthNames[today.getMonth()]} ${today.getFullYear()}`;





this.formattedOverheadTableData = [];

this.overheadRawData.forEach((entry) => {
  let isFirstRow = true;

  // First row of process — show processName & action
  this.formattedOverheadTableData.push({
    processName: entry.processName,
    month: currentMonthYear,
    repair: entry.repairAndMaintenance,
    sellMisc: entry.sellingDistributionAndMiscOverHeads,
    finance: entry.financeCost,
    total: entry.totalOverHeadsWithFinanceCost,
    isFirstRow: true
  });

  // Remaining rows — hide processName & action
  entry.previousOverheadsDetails.forEach(prev => {
    this.formattedOverheadTableData.push({
      processName: '', // Hide for UI
      month: this.formatMonth(prev.date),
      repair: prev.repairAndMaintenance,
      sellMisc: prev.sellingDistributionAndMiscOverHeads,
      finance: prev.financeCost,
      total: prev.totalOverHeadsWithFinanceCost,
      isFirstRow: false
    });
  });
});



});





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

  chosenYearHandler(normalizedYear: Date) {
    const ctrlValue = this.selectedMonthYear.value;
    ctrlValue.setFullYear(normalizedYear.getFullYear());
    this.selectedMonthYear.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: any) {
    const ctrlValue = this.selectedMonthYear.value;
    ctrlValue.setMonth(normalizedMonth.getMonth());
    this.selectedMonthYear.setValue(ctrlValue);
    this.currentMonth = this.formatMonthYear(ctrlValue);
    this.setMonthHeaders(ctrlValue);
    datepicker.close();
    this.loadOverheadsForMonth(ctrlValue);
  }

  loadOverheadsForMonth(baseDate: Date) {
    const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - 2, 1);

    const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-01`;
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const yearNo = startDate.getFullYear();
    this.store.dispatch(loadOverheads({ startDate: startDateStr, endDate: endDateStr, yearNo }));
  }

  openAddOverheads() {
    this.dialog.open(AddOverheadsComponent, {
      width: '500px'
    });
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

  startEditing(processName: string) {
    this.editingRow = processName;
  }

  saveOverheads() {
    const editedRow = this.overheadRawData.find(entry => entry.processName === this.editingRow);
    const updatedRow = this.overheadTable.find(row => row.processName === this.editingRow);

    if (!editedRow || !updatedRow) return;

    const currentMonth = this.currentMonth;
    const monthData = updatedRow[currentMonth];

    if (!monthData) return;

    const payload = {
      processName: updatedRow.processName,
      repairAndMaintenance: monthData.repairAndMaintenance,
      sellingDistributionAndMiscOverHeads: monthData.sellingDistributionAndMiscOverHeads,
      financeCost: monthData.financeCost
    };

    this.store.dispatch(updateOverhead({ id: editedRow._id, overhead: payload }));

    this.editingRow = null;
    this.backupRow = null;
  }

  cancelEdit() {
    if (this.backupRow) {
      const index = this.overheadTable.findIndex(row => row.processName === this.backupRow.processName);
      if (index !== -1) {
        this.overheadTable[index] = JSON.parse(JSON.stringify(this.backupRow));
      }
    }

    this.editingRow = null;
    this.backupRow = null;
  }

  formatMonthYear(date: string | Date): string {
  return dayjs(date).format('MMM YYYY'); // example: "Aug 2025"
}


formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split('T')[0].split('-'); // e.g., "2025-09-01"
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}
saveFormattedRow(row: any) {
  const matchingEntry = this.overheadRawData.find(entry => entry.processName === row.processName);
  if (!matchingEntry) return;

  const payload = {
    processName: row.processName,
    repairAndMaintenance: row.repair,
    sellingDistributionAndMiscOverHeads: row.sellMisc,
    financeCost: row.finance
  };

  this.store.dispatch(updateOverhead({ id: matchingEntry._id, overhead: payload }));

  this.editingRow = null;
}



}


