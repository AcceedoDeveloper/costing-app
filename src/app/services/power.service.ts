import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { ConfigService } from '../shared/components/config.service'; 
import { PowerCost} from '../models/over-head.model';
import { PowerCostData } from '../models/PowerCostData.model';
import { SalaryMapResponse} from '../models/salary-map.model'



@Injectable({
  providedIn: 'root'
})
export class PowerService {

  constructor(private http: HttpClient, private configService: ConfigService) { }

getPowerCosts(): Observable<PowerCost[]> {
  return this.http.get<PowerCost[]>(
    this.configService.getCostingUrl('getPowerCosts')
  ).pipe(
    tap(data => console.log('Extracted powerCosts:', data)) // ✅ now this will show the correct data
  );
}


updatePowerCost(id: string, powerCost: PowerCost): Observable<PowerCost> {
  return this.http.put<PowerCost>(
    `${this.configService.getCostingUrl('updatedPowerCost')}/${id}`,
    powerCost
  );
}


getPowerCostMap(): Observable<PowerCostData[]> {
  const today = new Date(); // e.g., 2025-07-15

  // ✅ End date: last day of current month (2025-07-31)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endDate = endOfMonth.toISOString().split('T')[0];

  // ✅ Start date: 6 months before, first day of that month (2025-01-01)
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1); // round to 1st of that month
  const startDate = sixMonthsAgo.toISOString().split('T')[0];

  const yearNo = today.getFullYear();

  const url = `http://localhost:3005/getPowercostMap?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('🌐 API URL:', url); // Confirm the full date range

  return this.http.get<{ data: PowerCostData[] }>(url).pipe(
    tap(res => console.log('✅ Full API Response:', res)),
    map(res => res.data),
    tap(data => console.log('📊 Power cost map history:', data))
  );
}




getSalaryMap(): Observable<SalaryMapResponse> {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]; // end of month
  const startDateObj = new Date(today);
  startDateObj.setMonth(startDateObj.getMonth() - 1);
  startDateObj.setDate(1); // first of previous month
  const startDate = startDateObj.toISOString().split('T')[0];

  const yearNo = today.getFullYear();

  const url = `http://localhost:3005/getSalaryMap?yearNo=${yearNo}&startDate=${startDate}&endDate=${endDate}`;
  console.log('📡 Salary API URL:', url);

  return this.http.get<{ data: SalaryMapResponse }>(url).pipe(
    map(res => res.data),
    tap(data => console.log('✅ Salary map response:', data))
  );
}





}
