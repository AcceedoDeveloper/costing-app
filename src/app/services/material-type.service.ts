import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MaterialType } from '../models/material-type.model';
import {Customerdetails} from '../models/Customer-details.model';
import { CustomerProcess } from '../models/Customer-details.model';

@Injectable({ providedIn: 'root' })
export class MaterialTypeService {
  private apiUrl = 'http://localhost:3005';

  constructor(private http: HttpClient) {}

  getMaterialTypes(): Observable<MaterialType[]> {
    return this.http.get<MaterialType[]>(`${this.apiUrl}/getMaterialType`);
  }

  addMaterialType(material: Partial<MaterialType>): Observable<MaterialType> {
    return this.http.post<MaterialType>(`${this.apiUrl}/addMaterialType`, material);
  }

  updateMaterialType(id: string, material: Partial<MaterialType>): Observable<MaterialType> {
    return this.http.patch<MaterialType>(`${this.apiUrl}/updateMaterialType/${id}`, material);
  }

  deleteMaterialType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteMaterialType/${id}`);
  }

  getCustomerDetails(): Observable<Customerdetails[]> {
    return this.http.get<Customerdetails[]>(`${this.apiUrl}/get-customers`);
  }



 addCustomerDetails(customer: CustomerProcess): Observable<CustomerProcess> {
  return this.http.post<CustomerProcess>(`${this.apiUrl}/add-Customers`, customer);
}

updateCustomerDetails(id: string, customer: CustomerProcess): Observable<CustomerProcess> {
  return this.http.put<CustomerProcess>(`${this.apiUrl}/update-Customer/${id}`, customer);
}


  


}