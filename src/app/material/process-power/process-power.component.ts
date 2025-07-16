

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

  displayMonths: number[] = [];
  currentDate = new Date();

  searchText: string = '';
  pageSize = 5;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store) {
    this.powerCosts$ = this.store.select(getPowerCostHistory);
  }

  ngOnInit(): void {
    this.generateMonthRange();
    this.store.dispatch(loadPowerCosts());

    this.powerCosts$.subscribe((data) => {
      this.allPowerCosts = data;
      this.applyFilters();
    });
  }

  generateMonthRange(): void {
    const currentMonth = this.currentDate.getMonth() + 1;
    this.displayMonths = [];
    for (let m = 3; m < currentMonth; m++) {  // Start from March (3)
      this.displayMonths.push(m);
    }
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

  getMonthName(month: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
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