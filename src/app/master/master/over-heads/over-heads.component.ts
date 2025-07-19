import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Overheads } from '../../../models/over-head.model';
import { loadOverheads } from '../store/master.action';
import { getoverheads } from '../store/master.selector';

@Component({
  selector: 'app-over-heads',
  templateUrl: './over-heads.component.html',
  styleUrls: ['./over-heads.component.css']
})
export class OverHeadsComponent implements OnInit {
  powerCostData$: Observable<Overheads[]>;
  tableHeaders: string[] = [];
  overheadTable: { processName: string; [month: string]: any }[] = [];

  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.store.dispatch(loadOverheads());
    this.powerCostData$ = this.store.select(getoverheads);

    this.powerCostData$.subscribe((data: Overheads[] | null | undefined) => {
      if (!data) return;

      const monthMap = new Map<string, Date>();
      const rows: { processName: string; [month: string]: any }[] = [];

      let currentMonthLabel = '';

      data.forEach(entry => {
        const row: { processName: string; [month: string]: any } = {
          processName: entry.processName
        };

        // Current month
        const currentMonth = new Date(entry.date);
        currentMonthLabel = this.formatMonthYear(currentMonth);
        monthMap.set(currentMonthLabel, currentMonth);
        row[currentMonthLabel] = entry.totalOverHeadsWithFinanceCost;

        // Previous months
        if (entry.previousOverheadsDetails && Array.isArray(entry.previousOverheadsDetails)) {
          entry.previousOverheadsDetails.forEach(prev => {
            const prevDate = new Date(prev.date);
            const label = this.formatMonthYear(prevDate);
            monthMap.set(label, prevDate);
            row[label] = prev.totalOverHeadsWithFinanceCost;
          });
        }

        rows.push(row);
      });

      // Step 1: Sort months by date DESC
      let sortedMonthLabels = Array.from(monthMap.entries())
        .sort((a, b) => b[1].getTime() - a[1].getTime())
        .map(([label]) => label);

      // Step 2: Take only last 3 months
      sortedMonthLabels = sortedMonthLabels.slice(0, 3);

      // Step 3: Move current month to the end
      const index = sortedMonthLabels.indexOf(currentMonthLabel);
      if (index !== -1) {
        sortedMonthLabels.splice(index, 1); // remove current month
        sortedMonthLabels.push(currentMonthLabel); // add at end
      }

      this.tableHeaders = sortedMonthLabels;
      this.overheadTable = rows;
    });
  }

  formatMonthYear(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Jul 2025"
  }
}
