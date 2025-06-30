import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Grade } from '../models/garde.model';
import { MaterialItem, MaterialMapResponse, Roles } from '../models/MaterialMap.model';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service'; 
import { OverHead} from '../models/over-head.model';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getMaterialMap(): Observable<MaterialMapResponse> {
    return this.http.get<MaterialMapResponse>(this.config.getCostingUrl('getMaterialMap')).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getRoles(): Observable<Roles[]> {
    return this.http.get<{ roleMap: Roles[] }>(this.config.getCostingUrl('getRoles')).pipe(
      map(response => response.roleMap)
    );
  }

  getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(this.config.getCostingUrl('getGrade'));
  }

  deleteGrade(gradeNo: string) {
    return this.http.delete<{ message: string }>(`${this.config.getCostingUrl('deleteGrade')}/${gradeNo}`);
  }

  addGrade(gradeData: any): Observable<any> {
    return this.http.post(this.config.getCostingUrl('addGrade'), gradeData);
  }

  updateGrade(id: string, gradeData: any): Observable<any> {
    return this.http.put(`${this.config.getCostingUrl('updateGrade')}/${id}`, gradeData);
  }


  getAccountTypes(): Observable<OverHead[]> {
  return this.http.get<OverHead[]>(this.config.getCostingUrl('getAccountTypes')).pipe(
    catchError(error => throwError(() => error))
  );
  }

  addAccountType(account: OverHead): Observable<OverHead> {
  return this.http.post<OverHead>(this.config.getCostingUrl('addAccountType'), account).pipe(
    catchError(error => throwError(() => error))
  );
}


updateAccountType(id: string, account: OverHead): Observable<OverHead> {
  return this.http.put<OverHead>(`${this.config.getCostingUrl('updateAccountType')}/${id}`, account).pipe(
    catchError(error => throwError(() => error))
  );
}

deleteAccountType(id: string): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(`${this.config.getCostingUrl('deleteAccountType')}/${id}`).pipe(
    catchError(error => throwError(() => error))
  );
}





}
