import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service'; 
import { PowerCost} from '../models/over-head.model';
import { PowerCostData } from '../models/PowerCostData.model';
import { SalaryMapResponse} from '../models/salary-map.model'
import { SalaryMapResponseData } from '../models/SalaryMapResponse.model';
import { Overheads } from '../models/over-head.model';

@Injectable({
  providedIn: 'root'
})
export class PowerService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

getPowerCosts(): Observable<PowerCost[]> {
  return this.http.get<PowerCost[]>(
    this.configService.getCostingUrl('getPowerCosts')
  ).pipe(
    tap(data => console.log('Extracted powerCosts:', data)) 
  );
}


updatePowerCost(id: string, powerCost: PowerCost): Observable<PowerCost> {
  return this.http.put<PowerCost>(
    `${this.configService.getCostingUrl('updatedPowerCost')}/${id}`,
    powerCost
  );
}


getPowerCostMap(): Observable<PowerCostData[]> {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endDate = endOfMonth.toISOString().split('T')[0];

  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  const startDate = sixMonthsAgo.toISOString().split('T')[0];

  const yearNo = today.getFullYear();

  const baseUrl = this.configService.getCostingUrl('getPowerCostMap');
  const url = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('🌐 Power Cost API URL:', url);

  return this.http.get<{ data: PowerCostData[] }>(url).pipe(
    tap(res => console.log('✅ Full API Response:', res)),
    map(res => res.data),
    tap(data => console.log('📊 Power cost map history:', data))
  );
}





getSalaryMap(startDate: string, endDate: string, yearNo: number): Observable<SalaryMapResponseData> {
  const baseUrl = this.configService.getCostingUrl('getSalaryMap');
  const url = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('📡 Salary API URL:', url);

  return this.http.get<{ data: SalaryMapResponseData }>(url).pipe(
    map(res => res.data),
    tap(data => console.log('✅ Salary map response:', data))
  );
}




addPowerCost(data: { processName: string; totalUnitPerProcess: number }) {
    return this.http.post('http://localhost:3005/addProcess-Powercost', data);
  }


uupdatePowerCost(id: string, data: PowerCostData): Observable<PowerCostData> {
  const url = `${this.configService.getCostingUrl('updatePowerCost')}/${id}`;
  return this.http.put<PowerCostData>(url, data);
}


adddSlaryProcess(data: any): Observable<any>{
  return this.http.post(this.configService.getCostingUrl('addProcess-SalaryWages'), data);
}



getOverHesdsMap(startDate: string, endDate: string, yearNo: number): Observable<Overheads[]> {
  const baseUrl = this.configService.getCostingUrl('getOverheadsMap');
  const url = `${baseUrl}?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('🌐 API URL:', url);

  return this.http.get<{ data: Overheads[] }>(url).pipe(
    map(res => res.data)
  );
}





 addOverhead(overhead: any): Observable<any> {
    return this.http.post(this.configService.getCostingUrl('addProcess-Overheads'), overhead);
  }


downloadQuotation(params: {
  CustomerName: string;
  drawingNo: string;
  partName: string;
  yearNo: number;
  start: string;
  end: string;
}) {
  const queryParams = new URLSearchParams({
    CustomerName: params.CustomerName,
    drawingNo: params.drawingNo,
    partName: params.partName,
    yearNo: params.yearNo.toString(),
    start: params.start,
    end: params.end,
  });

  const url = this.configService.getCostingUrl('customer/quotation') + `?${queryParams.toString()}`;
  console.log('Download URL:', url); 

  return this.http.get(url, { responseType: 'blob' });
}





updateSalaryProcess(id: string, payload: any): Observable<any> {
  const url = `${this.configService.getCostingUrl('updateSalaryWages')}/${id}`;
  return this.http.put(url, payload);
}


updateOverhead(id: string, data: any) {
  const url = `${this.configService.getCostingUrl('updateOverheads')}/${id}`;
  console.log("🔧 Updating overhead with ID:", id);
  console.log("📋 Data to update:", data);

  return this.http.put(url, data).pipe(
    tap(response => {
      console.log("✅ Server response after update:", response);
    })
  );
}



}
                    