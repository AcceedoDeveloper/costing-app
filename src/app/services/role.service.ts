import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role, Customer } from '../models/role.model';
import { Department, DepartmentUser } from '../models/users.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service'; // You already created this

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.config.getCostingUrl('role'));
  }

  addRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(this.config.getCostingUrl('addRole'), role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.config.getCostingUrl('updateRole')}/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.getCostingUrl('deleteRole')}/${id}`);
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.config.getCostingUrl('getCustomer'));
  }

  updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.config.getCostingUrl('updateCustomer')}/${id}`, data);
  }

  addCustomer(customer: Partial<Customer>): Observable<Customer> {
    console.log('Adding customer:', customer);
    return this.http.post<Customer>(this.config.getCostingUrl('addCustomer'), customer).pipe(
      tap((newCustomer) => {
        console.log('Customer added:', newCustomer);
      })
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.getCostingUrl('deleteCustomer')}/${id}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.config.getCostingUrl('getDept'));
  }

  addDepartment(department: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.config.getCostingUrl('addDept'), department);
  }

  updateDepartment(id: string, data: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.config.getCostingUrl('updateDept')}/${id}`, data);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.getCostingUrl('deleteDept')}/${id}`);
  }

  getDepartmentUsers(): Observable<DepartmentUser[]> {
    return this.http.get<DepartmentUser[]>(this.config.getCostingUrl('getDeptUsers'));
  }
}
