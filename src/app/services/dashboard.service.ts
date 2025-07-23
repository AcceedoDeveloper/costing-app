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


}
