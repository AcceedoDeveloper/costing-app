import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  } from 'rxjs';
import { Grade } from '../models/garde.model';
import { MaterialItem} from '../models/MaterialMap.model';
import { Roles } from '../models/MaterialMap.model';
import { map } from 'rxjs/operators';
import {  tap } from 'rxjs/operators';
import { MaterialMapResponse } from '../models/MaterialMap.model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) { }


getMaterialMap(): Observable<MaterialMapResponse> {
  return this.http.get<MaterialMapResponse>('http://localhost:3005/data').pipe(
   
    catchError(error => {
     
      return throwError(() => error);
    })
  );
}




  getRoles(): Observable<Roles[]> {
    return this.http.get<{ roleMap: Roles[] }>('http://localhost:3005/data').pipe(
      map(response => response.roleMap)
    );
  }


   getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.baseUrl}/getGrade`);
  }

  deleteGrade(gradeNo: string) {
  return this.http.delete<{ message: string }>(`http://localhost:3005/deleteGrade/${gradeNo}`);
}

   addGrade(gradeData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addGrade`, gradeData);
  }

  updateGrade(id: string, gradeData: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/updateGrade/${id}`, gradeData);
}


}
