import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Overheads } from '../../../models/over-head.model';
import { loadOverheads } from '../store/master.action';
import { getoverheads } from '../store/master.selector';
import { AddOverheadsComponent} from './add-overheads/add-overheads.component';


@Component({
  selector: 'app-over-heads',
  templateUrl: './over-heads.component.html',
  styleUrls: ['./over-heads.component.css']
})
export class OverHeadsComponent implements OnInit {
  powerCostData$: Observable<Overheads[]>;
  tableHeaders: string[] = [];
  overheadTable: { processName: string; [month: string]: any }[] = [];
  overheadRawData: Overheads[] = [];
  startDate!: Date;
  endDate!: Date;



  constructor(private store: Store, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.powerCostData$ = this.store.select(getoverheads);
    this.autoLoadOverheads();

    this.powerCostData$.subscribe((data: Overheads[] | null | undefined) => {
      if (!data) return;

       this.overheadRawData = data;

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
row[currentMonthLabel] = {
  repairAndMaintenance: entry.repairAndMaintenance,
  sellingDistributionAndMiscOverHeads: entry.sellingDistributionAndMiscOverHeads,
  financeCost: entry.financeCost,
  totalOverHeads: entry.totalOverHeads,
  totalOverHeadsWithFinanceCost: entry.totalOverHeadsWithFinanceCost,
};

        // Previous months
        if (entry.previousOverheadsDetails && Array.isArray(entry.previousOverheadsDetails)) {
          entry.previousOverheadsDetails.forEach(prev => {
            const prevDate = new Date(prev.date);
            const label = this.formatMonthYear(prevDate);
            monthMap.set(label, prevDate);
row[label] = {
  repairAndMaintenance: prev.repairAndMaintenance,
  sellingDistributionAndMiscOverHeads: prev.sellingDistributionAndMiscOverHeads,
  financeCost: prev.financeCost,
  totalOverHeads: prev.totalOverHeads,
  totalOverHeadsWithFinanceCost: prev.totalOverHeadsWithFinanceCost,
};
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


  openAddOverheads(){
    this.dialog.open(
      AddOverheadsComponent,{
        width:'500'
      }
    )
  }


   editOverheads(processName: string) {
    const match = this.overheadRawData.find(entry => entry.processName === processName);
    if (match) {
      this.dialog.open(AddOverheadsComponent, {
        width: '500px',
        data: match // Pass the data for editing
      });
    }
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
