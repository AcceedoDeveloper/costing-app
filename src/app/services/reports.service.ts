import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service';
import { CustomerdetailsIn } from '../models/Customer-details.model';
import { Pdfmaker } from '../master/master/pdfmaker/pdfmaker.model';
import { Quote } from '../models/Quote.model';
import { Quotation } from '../models/Quotation.model';


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


getQuoteTemplate() {
  const baseUrl = this.config.getCostingUrl('getQuoteTemplate');
  console.log("Fetching quote template from:", baseUrl);
  return this.http.get<Pdfmaker>(baseUrl);
}



updateQuoteTemplate(data: Pdfmaker): Observable<Pdfmaker> {
  // Deep-clone to strip any Angular metadata / prototypes before sending
  const payload = JSON.parse(JSON.stringify(data));
  console.log('updateQuoteTemplate payload:', payload);

  const baseUrl = this.config.getCostingUrl('updateQuoteTemplate');
  return this.http.put<Pdfmaker>(baseUrl, payload);
}



createQuotation(data: Quotation): Observable<Quotation> {
  // Deep-clone to strip any Angular metadata / prototypes before sending
  const payload = JSON.parse(JSON.stringify(data));
  console.log('createQuotation payload:', payload);
  const baseUrl = this.config.getCostingUrl('createQuotation');
  return this.http.post<Quotation>(baseUrl, payload);
}

updateQuotation(id: string, data: Quotation): Observable<Quotation> {
  // Deep-clone to strip any Angular metadata / prototypes before sending
  const payload = JSON.parse(JSON.stringify(data));
  console.log('updateQuotation payload:', payload);
  const baseUrl = this.config.getCostingUrl('updateQuotation');
  return this.http.put<Quotation>(`${baseUrl}/${id}`, payload);
}

getQuotations(): Observable<Quotation[]> {
  const baseUrl = this.config.getCostingUrl('getQuotations');
  console.log('Fetching quotations from:', baseUrl);
  return this.http.get<Quotation[]>(baseUrl);
}

deleteQuotation(id: string): Observable<any> {
  const baseUrl = this.config.getCostingUrl('deleteQuotation');
  console.log('Deleting quotation:', id);
  return this.http.delete(`${baseUrl}/${id}`);
}

  getQuotationByCustomerAndId(customerName: string, ids: string[]): Observable<Quotation[]> {
    const baseUrl = this.config.getCostingUrl('getQuotationByCustomerAndId');
    
    if (!ids || ids.length === 0) {
      console.error('getQuotationByCustomerAndId: No IDs provided');
      return this.http.get<Quotation[]>(baseUrl, { 
        params: new HttpParams().set('customerName', customerName) 
      });
    }
    
    // Join IDs with % separator as requested
    const idParam = ids.join('%');
    const params = new HttpParams()
      .set('customerName', customerName)
      .set('id', idParam);
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    console.log('Fetching quotation by customer and ID:', { 
      customerName, 
      ids, 
      idsCount: ids.length,
      idParam,
      fullUrl 
    });
    
    return this.http.get<Quotation[]>(baseUrl, { params });
  }

  printQuotation(customerName: string, ids: string[]): Observable<{ status: string; message: string; fileName: string }> {
    // Join IDs with % separator
    const idParam = ids.join('%');
    const params = new HttpParams()
      .set('customerName', customerName)
      .set('id', idParam);

    // Since getCostingUrl adds the url from config, we'll construct it manually
    const baseUrl = `${this.config.getCostingUrl('baseUrl')}printQuotation`;
    console.log('Printing quotation:', { customerName, ids, idParam, baseUrl });
    
    return this.http.get<{ status: string; message: string; fileName: string }>(baseUrl, { params });
  }

}
