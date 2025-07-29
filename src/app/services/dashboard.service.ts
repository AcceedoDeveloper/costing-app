import { Injectable } from '@angular/core';
import { ConfigService } from '../shared/components/config.service'; 
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient, private config: ConfigService) { }

  getdata(): Observable<any> {
    return this.http.get<any>(this.config.getCostingUrl('dashboard-data'));
  }


// costing.service.ts or your API service
getQuoteData(customer: string, drawing: string, part: string): Observable<any> {
  const url = `http://localhost:3005/getQuotationData/${customer}/${drawing}/${part}`;
  return this.http.get<any>(url);
}


uploadExcelFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>('http://localhost:3005/material/upload', formData);
  }


}
