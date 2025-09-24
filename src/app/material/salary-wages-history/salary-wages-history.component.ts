import { Component, OnInit } from '@angular/core';
import { ProcessService } from '../../services/process.service';
import { SalaryHistory, OverHeadsHistory } from '../../models/process.model';

@Component({
  selector: 'app-salary-wages-history',
  templateUrl: './salary-wages-history.component.html',
  styleUrls: ['./salary-wages-history.component.css']
})




export class SalaryWagesHistoryComponent implements OnInit {
  salaryHistory: SalaryHistory[] = [];
  filteredSalaryHistory: SalaryHistory[] = [];

  overHeadsHistory: OverHeadsHistory[] = [];
  filteredOverHeadsHistory: OverHeadsHistory[] = [];

  salaryStartDate: Date | null = null;
  salaryEndDate: Date | null = null;

  overheadStartDate: Date | null = null;
  overheadEndDate: Date | null = null;

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadSalaryWagesHistory();
    this.loadOverHeadsHistory();
  }

  loadSalaryWagesHistory(): void {
    this.processService.getSalaryAndWagesHistory().subscribe({
      next: (data: any) => {
        this.salaryHistory = Array.isArray(data) ? data : (data?.SalaryAndWagesHistory || []);
        this.filteredSalaryHistory = [...this.salaryHistory]; // initially full list
      },
      error: (err) => {
        console.error('Error fetching Salary & Wages History:', err);
        this.salaryHistory = [];
        this.filteredSalaryHistory = [];
      }
    });
  }

  loadOverHeadsHistory(): void {
    this.processService.getOverHeadsHistory().subscribe({
      next: (data: any) => {
        this.overHeadsHistory = Array.isArray(data) ? data : (data?.OverHeadsHistory || []);
        this.filteredOverHeadsHistory = [...this.overHeadsHistory]; // initially full list
      },
      error: (err) => {
        console.error('Error fetching Overheads History:', err);
        this.overHeadsHistory = [];
        this.filteredOverHeadsHistory = [];
      }
    });
  }

  applySalaryFilter(): void {
    this.filteredSalaryHistory = this.salaryHistory.filter(item => {
      const date = new Date(item.updatedAt);
      return (!this.salaryStartDate || date >= this.salaryStartDate) &&
             (!this.salaryEndDate || date <= this.salaryEndDate);
    });
  }

  applyOverheadFilter(): void {
    this.filteredOverHeadsHistory = this.overHeadsHistory.filter(item => {
      const date = new Date(item.updatedAt);
      return (!this.overheadStartDate || date >= this.overheadStartDate) &&
             (!this.overheadEndDate || date <= this.overheadEndDate);
    });
  }
}
