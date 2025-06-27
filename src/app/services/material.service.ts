import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Material } from '../models/material.model';
import { Supplier } from '../models/Supplier.model';
import { ConfigService } from '../shared/components/config.service'; // ✅ Added

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getMaterials(): Observable<Material[]> {
    return this.http.get<{ materials: Material[] }>(
      this.config.getCostingUrl('getMaterial')
    ).pipe(map(res => res.materials));
  }

  addMaterial(material: Material): Observable<Material> {
    return this.http.post<Material>(this.config.getCostingUrl('addMaterial'), material);
  }

  updateMaterial(material: Material): Observable<Material> {
    return this.http.put<Material>(
      `${this.config.getCostingUrl('updateMaterial')}/${material._id}`,
      material
    );
  }

  deleteMaterial(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.config.getCostingUrl('deleteMaterial')}/${id}`
    );
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.config.getCostingUrl('getSupplier'));
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.config.getCostingUrl('addSupplier'), supplier);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(
      `${this.config.getCostingUrl('updateSupplier')}/${supplier._id}`,
      supplier
    );
  }

  deleteSupplier(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.config.getCostingUrl('deleteSupplier')}/${id}`
    );
  }
}
