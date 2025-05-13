import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) { }

  getMaterials(): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/getMaterial`);
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
