




import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PowerCostData } from '../../models/PowerCostData.model';
import { loadPowerCosts } from '../store/material.actions';
import { getPowerCostHistory } from '../store/material.selector';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-process-power',
  templateUrl: './process-power.component.html',
  styleUrls: ['./process-power.component.css']
})
export class ProcessPowerComponent implements OnInit {
  powerCosts$: Observable<PowerCostData[]>;
  allPowerCosts: PowerCostData[] = [];
  filteredPowerCosts: PowerCostData[] = [];
  paginatedPowerCosts: PowerCostData[] = [];

  displayMonths: number[] = []; // Previous 5 months only
  currentDate = new Date();

  searchText: string = '';
  pageSize = 5;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store) {
    this.powerCosts$ = this.store.select(getPowerCostHistory);
  }

  ngOnInit(): void {
    this.generateLastFiveMonths(); // ✅ Always 5 months before current
    this.store.dispatch(loadPowerCosts());

    this.powerCosts$.subscribe((data) => {
      this.allPowerCosts = data;
      this.applyFilters();
    });
  }

  /**
   * ✅ Generates exactly 5 months before the current one
   * If current is October → [5, 6, 7, 8, 9] (May to Sep)
   */
  generateLastFiveMonths(): void {
    const currentMonthIndex = this.currentDate.getMonth(); // 0-based
    this.displayMonths = [];

    for (let i = 5; i >= 1; i--) {
      let monthIndex = currentMonthIndex - i;
      if (monthIndex < 0) {
        monthIndex += 12; // wrap to previous year
      }
      this.displayMonths.push(monthIndex + 1); // 1-based
    }

    console.log('🗓 Showing 5 previous months:', this.displayMonths.map(m => this.getMonthName(m)));
  }

  getMonthName(month: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[(month - 1 + 12) % 12];
  }

  applyFilters(): void {
    const query = this.searchText.toLowerCase();
    this.filteredPowerCosts = this.allPowerCosts.filter(item =>
      item.processName.toLowerCase().includes(query)
    );
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPowerCosts = this.filteredPowerCosts.slice(start, end);
  }

  getMonthData(details: any[], month: number): any | null {
    return details.find(d => {
      const date = new Date(d.date);
      return date.getMonth() + 1 === month;
    }) || null;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }
}