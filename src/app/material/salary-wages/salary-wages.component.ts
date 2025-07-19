import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SalaryMapResponseData, SalaryEntry } from '../../models/SalaryMapResponse.model';
import { loadSalaryMap } from '../store/material.actions';
import { getsalaryMap } from '../store/material.selector';
import {AddSalaryWagesComponent } from './add-salary-wages/add-salary-wages.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-salary-wages',
  templateUrl: './salary-wages.component.html',
  styleUrls: ['./salary-wages.component.css']
})
export class SalaryWagesComponent implements OnInit {
  salaryMap$: Observable<SalaryMapResponseData[]>;
  tableHeaders: string[] = []; // Dynamic months like ['Jul 2025', 'Jun 2025']
  salaryTable: { processName: string; [month: string]: any }[] = [];

  constructor(private store: Store, private dialog: MatDialog) {
    this.store.dispatch(loadSalaryMap());
  }

ngOnInit() {
  this.salaryMap$ = this.store.select(getsalaryMap);

  this.salaryMap$.subscribe((data: any[] | null | undefined) => {
    if (!data) return;

    const monthMap = new Map<string, Date>(); // to store unique month labels with real Date
    const rows: { processName: string; [month: string]: any }[] = [];

    let currentMonthLabel = '';

    data.forEach((entry: SalaryEntry) => {
      if (!entry) return;

      const row: { processName: string; [month: string]: any } = {
        processName: entry.processName
      };

      // Current month
      const currentMonth = new Date(entry.date);
      currentMonthLabel = this.formatMonthYear(currentMonth);
      monthMap.set(currentMonthLabel, currentMonth);
      row[currentMonthLabel] = entry.TotalOutSourcingCost;

      // Previous months
      if (entry.previousSalaryWagesDetails && Array.isArray(entry.previousSalaryWagesDetails)) {
        entry.previousSalaryWagesDetails.forEach(prev => {
          if (prev?.date) {
            const prevDate = new Date(prev.date);
            const prevLabel = this.formatMonthYear(prevDate);
            monthMap.set(prevLabel, prevDate);
            row[prevLabel] = prev.TotalOutSourcingCost;
          }
        });
      }

      rows.push(row);
    });

    // Step 1: Sort months by date DESC
    let sortedMonthLabels = Array.from(monthMap.entries())
      .sort((a, b) => b[1].getTime() - a[1].getTime())
      .map(([label]) => label);

    // Step 2: Take only top 3 months
    sortedMonthLabels = sortedMonthLabels.slice(0, 3);

    // Step 3: Move current month to end if it's in top 3
    const index = sortedMonthLabels.indexOf(currentMonthLabel);
    if (index !== -1) {
      sortedMonthLabels.splice(index, 1); // remove current month
      sortedMonthLabels.push(currentMonthLabel); // add to end
    }

    this.tableHeaders = sortedMonthLabels;
    this.salaryTable = rows;
  });
}

formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., 'Jul 2025'
}


addSalarywages(){
 this.dialog.open(
  AddSalaryWagesComponent,
  {
    width: '500px'
  }
 );
}


}
