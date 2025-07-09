import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MaterialType } from '../models/material-type.model';
import { Customerdetails, CustomerdetailsIn, CustomerProcess, CustomerProcesss } from '../models/Customer-details.model';
import { ConfigService } from '../shared/components/config.service'; // ✅

@Injectable({ providedIn: 'root' })
export class MaterialTypeService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  getMaterialTypes(): Observable<MaterialType[]> {
    return this.http.get<MaterialType[]>(this.config.getCostingUrl('getMaterialType'));
  }

  addMaterialType(material: Partial<MaterialType>): Observable<MaterialType> {
    return this.http.post<MaterialType>(this.config.getCostingUrl('addMaterialType'), material);
  }

  updateMaterialType(id: string, material: Partial<MaterialType>): Observable<MaterialType> {
    return this.http.patch<MaterialType>(`${this.config.getCostingUrl('updateMaterialType')}/${id}`, material);
  }

  deleteMaterialType(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('deleteMaterialType')}/${id}`);
  }

  getCustomerDetails(): Observable<Customerdetails[]> {
    return this.http.get<Customerdetails[]>(this.config.getCostingUrl('getCustomers'));
  }

  addCustomerDetails(customer: CustomerProcesss): Observable<CustomerProcesss> {
    console.log('data', customer);
    return this.http.post<CustomerProcesss>(this.config.getCostingUrl('addCustomers'), customer);
  }

  updateCustomerDetails(id: string, customer: CustomerProcess): Observable<CustomerProcess> {
    return this.http.put<CustomerProcess>(`${this.config.getCostingUrl('updateCustomer')}/${id}`, customer);
  }

  getCustomerDetailsPeocess(): Observable<CustomerdetailsIn[]> {
    return this.http.get<CustomerdetailsIn[]>(this.config.getCostingUrl('getCustomers'));
  }

  delectCustomerDetails(id: string): Observable<any> {
    return this.http.delete(`${this.config.getCostingUrl('delete-Customer')}/${id}`);
  }
}
