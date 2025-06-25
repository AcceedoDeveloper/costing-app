import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CastingInput, MouldingInput, CoreInput } from '../models/casting-input.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CastingInputService  {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCastingInputs(): Observable<CastingInput[]> {
    return this.http.get<CastingInput[]>(`${this.baseUrl}/getCastingInputs`);
  }

   updateCastingInput(id: string, data: CastingInput): Observable<CastingInput> {
    return this.http.put<CastingInput>(`${this.baseUrl}/updateCastingInputs/${id}`, data);
  }

  getMouldingInputs(): Observable<MouldingInput[]> {
    return this.http.get<MouldingInput[]>(`${this.baseUrl}/getMouldingInputs`);
  }

  updateMouldingInput(id: string, data: MouldingInput): Observable<MouldingInput> {
    return this.http.put<MouldingInput>(`${this.baseUrl}/updateMouldingInputs/${id}`, data);
  }

 getCoreInputs(): Observable<CoreInput[]> {
  return this.http.get<CoreInput[]>(`${this.baseUrl}/getCoreInputs`).pipe(
    tap(data => console.log('Fetched core inputs:', data))
  );
}

  updateCoreInput(id: string, data: CoreInput): Observable<CoreInput> {
    return this.http.put<CoreInput>(`${this.baseUrl}/updateCoreInputs/${id}`, data);
  }


}