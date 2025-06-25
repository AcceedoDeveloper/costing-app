import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Role,  } from '../models/role.model';
import { Observable } from 'rxjs';
import { Customer } from '../models/role.model'; 
import { tap } from 'rxjs/operators';
import { Department } from '../models/users.model';
import { DepartmentUser } from '../models/users.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RoleService {
 private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/getRole`);
  }

  addRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/addRole`, role);
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/updateRole/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteRole/${id}`);
  }

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.baseUrl}/getCustomer`);
  }

  updateCustomer(id: string, data: Partial<Customer>) {
  return this.http.put<Customer>(`${this.baseUrl}/updateCustomer/${id}`, data);
}


  addCustomer(customer: Partial<Customer>): Observable<Customer> {
    console.log('Adding customer:', customer);
    return this.http.post<Customer>(`${this.baseUrl}/addCustomer`, customer).pipe(
      tap((newCustomer) => {
        console.log('Customer added:', newCustomer);
      })
    );
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteCustomer/${id}`);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/getDept`);
  }

  addDepartment(department: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/addDept`, department);
  }

  updateDepartment(id: string, data: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/updateDept/${id}`, data);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteDept/${id}`);
  }

  getDepartmentUsers(): Observable<DepartmentUser[]> {
    return this.http.get<DepartmentUser[]>(`${this.baseUrl}/data`);
  }


}
