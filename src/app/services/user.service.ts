import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/users.model';
import { Observable } from 'rxjs';
import { ConfigService } from '../shared/components/config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.config.getCostingUrl('createUser'), user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.config.getCostingUrl('getUsers'));
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

    return this.http.put<User>(`${this.config.getCostingUrl('updateUser')}/${user._id}`, updatedUser);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.config.getCostingUrl('deleteUser')}/${id}`);
  }
}
