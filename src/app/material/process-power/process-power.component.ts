import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PowerCostData } from '../../models/PowerCostData.model';
import { loadPowerCosts } from '../store/material.actions';
import { getPowerCostHistory } from '../store/material.selector';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loadProcesses } from '../store/material.actions';
import { getAllProcesses } from '../store/material.selector';
import { Process } from '../../models/process.model';
import { addPowerCost } from '../store/material.actions';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private store: Store, private fb: FormBuilder) {
    this.powerCosts$ = this.store.select(getPowerCostHistory);

  }

  ngOnInit(): void {
    this.generateLastFiveMonths();
    this.store.dispatch(loadPowerCosts());

    this.powerCosts$.subscribe((data) => {
      console.log('data', data)
      this.allPowerCosts = data;
      this.applyFilters();
    });

     this.processForm = this.fb.group({
      processName: ['', Validators.required],
      totalUnitPerProcess: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });

    this.store.dispatch(loadProcesses());
    
     this.store.select(getAllProcesses).subscribe((data: Process[]) => {
  console.log('Original Data:', data);
  this.processes = (data || []).filter(Boolean); 
    this.processNames = this.processes.filter(p => p.processName).map(p => p.processName);
});

    

  }

  
  generateLastFiveMonths(): void {
    const currentMonthIndex = this.currentDate.getMonth(); 
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

  openPopup(): void {
    this.processForm.reset();
  this.showPopup = true;
}

closePopup(): void {
  this.showPopup = false;
}


onSave(): void {
  if (this.processForm.valid) {
    const processData = this.processForm.value;

    console.log('Form Data:', processData);

    this.store.dispatch(addPowerCost({ processData })); // ✅ Correct dispatch
    this.store.dispatch(loadPowerCosts());

    this.closePopup();
  } else {
    console.warn('Form Invalid');
  }
}


}