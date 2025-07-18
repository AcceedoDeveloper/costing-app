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



}
