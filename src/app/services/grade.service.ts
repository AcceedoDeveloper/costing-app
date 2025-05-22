import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  } from 'rxjs';
import { Grade } from '../models/garde.model';
import { MaterialItem} from '../models/MaterialMap.model';
import { Roles } from '../models/MaterialMap.model';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private baseUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) { }


  // grade.service.ts
getMaterialMap() {
  return this.http.get<{ materialMap: { [key: string]: MaterialItem[] } }>('http://localhost:3005/data');
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

}
