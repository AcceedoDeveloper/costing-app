
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { PowerCostData } from '../../models/PowerCostData.model';
import {
  loadPowerCosts,
  addPowerCost,
  updatePowerCost,
  loadProcesses
} from '../store/material.actions';
import {
  getPowerCostHistory,
  getAllProcesses
} from '../store/material.selector';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Process } from '../../models/process.model';

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

  showPopup: boolean = false;
  processForm!: FormGroup;

  processes: Process[] = [];
  processNames: string[] = [];

  displayMonths: number[] = [];
  currentDate = new Date();

  searchText: string = '';
  pageSize = 5;
  currentPage = 0;

  editMode: boolean = false;
  editId: string | null = null;

  successMessage: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store, private fb: FormBuilder) {
    this.powerCosts$ = this.store.select(getPowerCostHistory);
  }

  ngOnInit(): void {
    this.generateLastFiveMonths();
    this.store.dispatch(loadPowerCosts());
    this.store.dispatch(loadProcesses());

    this.processForm = this.fb.group({
      processName: ['', Validators.required],
      totalUnitPerProcess: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });

    this.subscriptions.add(
      this.store.select(getAllProcesses).subscribe((data: Process[]) => {
        this.processes = (data || []).filter(Boolean);
        this.processNames = this.processes.map(p => p.processName);
      })
    );

    this.subscriptions.add(
      this.powerCosts$.subscribe((data) => {
        this.allPowerCosts = data;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  generateLastFiveMonths(): void {
    const currentMonthIndex = this.currentDate.getMonth();
    this.displayMonths = [];

    for (let i = 5; i >= 1; i--) {
      let monthIndex = currentMonthIndex - i;
      if (monthIndex < 0) monthIndex += 12;
      this.displayMonths.push(monthIndex + 1);
    }
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

  openPopup(): void {
    this.processForm.reset();
    this.successMessage = '';
    this.showPopup = true;
    this.editMode = false;
    this.editId = null;
  }

  closePopup(): void {
    this.showPopup = false;
    this.successMessage = '';
  }
onSave(): void {
  if (this.processForm.valid) {
    const processData = this.processForm.value;

    if (this.editMode && this.editId) {
      console.log('Updating ID:', this.editId);
      console.log('data', processData);
this.store.dispatch(updatePowerCost({ id: this.editId, updatedData: processData }));
    } else {
      this.store.dispatch(addPowerCost({ processData }));
      this.successMessage = 'Power cost added successfully!';
    }

    setTimeout(() => {
      this.store.dispatch(loadPowerCosts());
    }, 500);

    this.closePopup();
  }
}

  onEdit(item: PowerCostData): void {
    this.editMode = true;
    this.editId = item.processId;

    this.processForm.patchValue({
      processName: item.processName,
      totalUnitPerProcess: item.totalUnitPerProcess
    });

    this.successMessage = '';
    this.showPopup = true;
  }
}

