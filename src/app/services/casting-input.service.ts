import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../shared/components/config.service';
import {CastingData } from '../models/casting-input.model';
import {CostSummary } from '../models/casting-input.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FlatCastingData } from '../models/casting-input.model';

@Injectable({
  providedIn: 'root'
})
export class CastingInputService {
  constructor(private http: HttpClient, private config: ConfigService) {}


  

  getCastingDetails(): Observable<CastingData[]> {
  return this.http.get<CastingData[]>(this.config.getCostingUrl('getProduction')).pipe(
    tap(castingData => {
      console.log('Casting Data:', castingData);
    })
  );
}
    getCostSummary(): Observable<CostSummary[]> {
  return this.http.get<CostSummary[]>(this.config.getCostingUrl('getProductionCosts')).pipe(
    tap(costSummary => {
      console.log('Cost Summary:', costSummary);
    })
  );
}

  updateProductionCost(costSummary: CostSummary): Observable<CostSummary> {
    return this.http.put<CostSummary>(`${this.config.getCostingUrl('updateProductionCosts')}/${costSummary._id}`, costSummary).pipe(
      tap(updatedCostSummary => {
        console.log('Updated Cost Summary:', updatedCostSummary);
      })
    );
  }


  updateProductionInputs(castingData: CastingData): Observable<CastingData> {
    return this.http.put<CastingData>(`${this.config.getCostingUrl('updateProductionInputs')}/${castingData._id}`, castingData).pipe(
      tap(updatedCastingData => {
        console.log('Updated Casting Data:', updatedCastingData);
      })
    );
  }


  updateFlatSummary(id: string, data: FlatCastingData): Observable<any> {
  return this.http.put(`${this.config.getCostingUrl('updateProductionInputs')}/${id}`, data).pipe(
    tap(() => {
      console.log('✅ Flat summary data sent:', data);
    })
  );
}






  
}
