import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { ConfigService } from '../shared/components/config.service'; 
import { PowerCost} from '../models/over-head.model';



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





}
