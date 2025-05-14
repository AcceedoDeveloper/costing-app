import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  } from 'rxjs';
import { Material } from '../models/material.model';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) { }

 getMaterials(): Observable<Material[]> {
  return this.http.get<{ materials: Material[] }>(`${this.apiUrl}/getMaterial`)
    .pipe(
      map(response => response.materials)
    );
}


  deleteMaterial(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteMaterial/${id}`);
  }

   addMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/addMaterial`, material);
  }

  
  updateMaterial(material: Material): Observable<Material> {
    return this.http.put<Material>(`${this.apiUrl}/updateMaterial`, material);
  }


}
