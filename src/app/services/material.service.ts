import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  } from 'rxjs';
import { Material } from '../models/material.model';
import { map, tap } from 'rxjs/operators';
import {Supplier} from '../models/Supplier.model';



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
    return this.http.put<Material>(`${this.apiUrl}/updateMaterial/${material._id}`, material);
  }


getSuppliers(): Observable<Supplier[]> {
  return this.http.get<Supplier[]>(`${this.apiUrl}/getSupplier`);
}

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/addSupplier`, supplier);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    console.log('Updating supplier:', supplier._id, supplier);
    return this.http.put<Supplier>(`${this.apiUrl}/updateSupplier/${supplier._id}`, supplier);
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteSupplier/${id}`);
  }

}
