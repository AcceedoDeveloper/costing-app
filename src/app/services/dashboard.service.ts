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



getQuoteData(customer: string, drawing: string, part: string): Observable<any> {
  const baseUrl = this.config.getCostingUrl('getQuotationData');
  const url = `${baseUrl}/${customer}/${drawing}/${part}`;
  console.log('📝 Quotation URL:', url);

  return this.http.get<any>(url);
}



uploadExcelFile(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  const uploadUrl = this.config.getCostingUrl('uploadMaterialExcel');
  console.log('📤 Upload URL:', uploadUrl);

  return this.http.post<any>(uploadUrl, formData);
}


materialGraphData(startDate: string, endDate: string): Observable<any> {
  const yearNo = new Date().getFullYear();
  console.log('📊 Fetching material graph data for year:', yearNo);
  const baseUrl = this.config.getCostingUrl('getMaterialMapgraph');
  const url2 = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  return this.http.get<any>(url2);
}




getResentUpdatedData(yearNo: number, startDate: string, endDate: string): Observable<any> {
  const baseUrl = this.config.getCostingUrl('resentUpdate');
  const url = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('Fetching resent updated data from:', url);
  return this.http.get<any>(url);
}

ActualEstimationCost( startDate: string, endDate: string): Observable<any> {
   const yearNo = new Date().getFullYear();
    const baseUrl = this.config.getCostingUrl('ActualEstimationCost');
    const url = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
    console.log('Fetching actual estimation cost from:', url);
    return this.http.get<any>(url);
  }

downloadMaterialExcel(): Observable<Blob> {
  const downloadUrl = this.config.getCostingUrl('Export-material');
  console.log('📥 Download URL:', downloadUrl);
  
  return this.http.get(downloadUrl, { responseType: 'blob' }).pipe(
    map((response: Blob) => {
      console.log('📄 Material Excel downloaded successfully');
      return response;
    }),
    catchError((error) => {
      console.error('❌ Error downloading Material Excel:', error);
      throw error;
    })
  );
}


}
