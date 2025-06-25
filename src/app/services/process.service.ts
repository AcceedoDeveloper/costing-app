import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,  } from 'rxjs';
import { Process } from '../models/process.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcessService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getProcesses(): Observable<Process[]> {
  return this.http.get<Process[]>(`${this.apiUrl}/getProcess`);
}


  addProcess(process: Partial<Process>): Observable<Process> {
    return this.http.post<Process>(`${this.apiUrl}/addProcess`, process);
  }

  updateProcess(id: string, process: Partial<Process>): Observable<Process> {
    return this.http.put<Process>(`${this.apiUrl}/updateProcessType/${id}`, process);
  }

  deleteProcess(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteProcessType/${id}`);
  }
}
