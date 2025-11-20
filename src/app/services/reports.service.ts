import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service';
import { CustomerdetailsIn } from '../models/Customer-details.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) { }

  getCustomerDetails(params: {
    customerName?: string;
    partName?: string;
    drawingNo?: string;
    revision?: string;
    StartDate?: string;
    EndDate?: string;
    page?: number;
    limit?: number;
  }): Observable<{ data: CustomerdetailsIn[]; total?: number; page?: number; limit?: number }> {
    let httpParams = new HttpParams();

    // Allow empty strings to be sent (API might expect them)
    if (params.customerName !== undefined) {
      httpParams = httpParams.set('customerName', params.customerName || '');
    }
    if (params.partName !== undefined) {
      httpParams = httpParams.set('partName', params.partName || '');
    }
    if (params.drawingNo !== undefined) {
      httpParams = httpParams.set('drawingNo', params.drawingNo || '');
    }
    if (params.revision !== undefined) {
      httpParams = httpParams.set('revision', params.revision || '');
    }
    if (params.StartDate !== undefined) {
      httpParams = httpParams.set('StartDate', params.StartDate || '');
    }
    if (params.EndDate !== undefined) {
      httpParams = httpParams.set('EndDate', params.EndDate || '');
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    const baseUrl = this.config.getCostingUrl('getCustomerDetails');
    console.log('📊 Fetching customer details from:', baseUrl);
    console.log('📊 Query params:', httpParams.toString());

    return this.http.get<{ data: CustomerdetailsIn[]; total?: number; page?: number; limit?: number } | CustomerdetailsIn[]>(baseUrl, {
      params: httpParams
    }).pipe(
      map((response) => {
        // Handle both response formats: array directly or wrapped in object
        if (Array.isArray(response)) {
          return { data: response, total: response.length };
        }
        return response as { data: CustomerdetailsIn[]; total?: number; page?: number; limit?: number };
      })
    );
  }

  updateStatus(id: string, customerData: any): Observable<any> {
    console.log('Updating status for customer:', id);
    console.log('Sending data:', customerData);
    const baseUrl = this.config.getCostingUrl('updateCustomerD');
    return this.http.patch(`${baseUrl}/${id}`, customerData);
  }
}
