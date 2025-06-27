import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CastingInput, MouldingInput, CoreInput } from '../models/casting-input.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service';

@Injectable({
  providedIn: 'root'
})
export class CastingInputService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getCastingInputs(): Observable<CastingInput[]> {
    return this.http.get<CastingInput[]>(this.config.getCostingUrl('getCastingInputs'));
  }

  updateCastingInput(id: string, data: CastingInput): Observable<CastingInput> {
    return this.http.put<CastingInput>(`${this.config.getCostingUrl('updateCastingInputs')}/${id}`, data);
  }

  getMouldingInputs(): Observable<MouldingInput[]> {
    return this.http.get<MouldingInput[]>(this.config.getCostingUrl('getMouldingInputs'));
  }

  updateMouldingInput(id: string, data: MouldingInput): Observable<MouldingInput> {
    return this.http.put<MouldingInput>(`${this.config.getCostingUrl('updateMouldingInputs')}/${id}`, data);
  }

  getCoreInputs(): Observable<CoreInput[]> {
    return this.http.get<CoreInput[]>(this.config.getCostingUrl('getCoreInputs')).pipe(
      tap(data => console.log('Fetched core inputs:', data))
    );
  }

  updateCoreInput(id: string, data: CoreInput): Observable<CoreInput> {
    return this.http.put<CoreInput>(`${this.config.getCostingUrl('updateCoreInputs')}/${id}`, data);
  }
}
