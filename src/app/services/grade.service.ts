import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grade } from '../models/garde.model';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) { }

   getAll(): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.baseUrl}/getGrade`);
  }

  deleteGrade(gradeNo: string) {
  return this.http.delete<{ message: string }>(`http://localhost:3005/deleteGrade/${gradeNo}`);
}

}
