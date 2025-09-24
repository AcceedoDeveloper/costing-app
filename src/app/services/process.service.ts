import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Process } from '../models/process.model';
import { ConfigService } from '../shared/components/config.service'; // ✅ Use ConfigService

@Injectable({ providedIn: 'root' })


export class ProcessService {
  constructor(private http: HttpClient, private config: ConfigService) {}




  getProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(this.config.getCostingUrl('getProcess'));
  }

  addProcess(process: Partial<Process>): Observable<Process> {
    return this.http.post<Process>(this.config.getCostingUrl('addProcess'), process);
  }

  updateProcess(id: string, process: Partial<Process>): Observable<Process> {
    return this.http.put<Process>(`${this.config.getCostingUrl('updateProcessType')}/${id}`, process);
  }

  deleteProcess(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteProcessType')}/${id}`);
  }

 

  updateSalary(id: string, salary : any): Observable<any> {
    return this.http.put<any>(`${this.config.getCostingUrl('UpdateSalaryAndWages')}/${id}`, salary);
  }

  updateOverheads(id: string, overheads : any): Observable<any> {
    return this.http.put<any>(`${this.config.getCostingUrl('UpdateOverHeadsByIds')}/${id}`, overheads);
  }

    getSalaryAndWagesHistory():Observable<any[]>{
    return this.http.get<any[]>(this.config.getCostingUrl('getSalaryAndWagesHistory'))
  }

  
  getOverHeadsHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.config.getCostingUrl('getOverHeadsHistory'));
  }



}
