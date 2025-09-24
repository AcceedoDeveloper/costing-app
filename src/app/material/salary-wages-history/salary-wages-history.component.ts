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
  overHeadsHistory: OverHeadsHistory[] = [];
  isLoading: boolean = true; 
  errorMessage: string | null = null; 

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadSalaryWagesHistory();
    this.loadOverHeadsHistory();
  }

  loadSalaryWagesHistory(): void {
    this.isLoading = true;
    this.processService.getSalaryAndWagesHistory().subscribe({
      next: (data: any) => {
    
        this.salaryHistory = Array.isArray(data) ? data : (data?.SalaryAndWagesHistory || []);
        console.log('Salary & Wages History Data:', data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching Salary & Wages History:', err);
        this.errorMessage = 'Failed to load salary and wages history.';
        this.salaryHistory = [];
        this.isLoading = false;
      }
    });
  }

  loadOverHeadsHistory(): void {
    this.isLoading = true;
    this.processService.getOverHeadsHistory().subscribe({
      next: (data: any) => {
      
        this.overHeadsHistory = Array.isArray(data) ? data : (data?.OverHeadsHistory || []);
        console.log('Overheads History Data:', data);
      
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching Overheads History:', err);
        this.errorMessage = 'Failed to load overheads history.';
        this.overHeadsHistory = [];
        this.isLoading = false;
      }
    });
  }
}