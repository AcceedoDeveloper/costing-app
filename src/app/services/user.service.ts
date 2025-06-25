import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/users.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/createUser`, user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/getUsers`);
  }

  updateUser(user: User): Observable<User> {
    console.log('userID', user._id); 
    console.log(user);

    const updatedUser: Partial<User> = {
      UserName: user.UserName,
      department: user.department,
      role: typeof user.role === 'object' && user.role !== null ? user.role.name : user.role,
      userName: user.userName,
      password: user.password
    };

    console.log('Modified user object:', updatedUser);

    
    return this.http.put<User>(`${this.apiUrl}/UpdateUser/${user._id}`, updatedUser);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/deleteUser/${id}`);
  }
}
