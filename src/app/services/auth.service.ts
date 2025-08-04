import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../shared/components/config.service';
import { AuthResponseData } from '../models/AuthResponseData.model';
import { User } from '../models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private store: Store<AppState>, private config: ConfigService) {}

  login(username: string, password: string): Observable<AuthResponseData> {
    const loginUrl = this.config.getCostingUrl('login');
    return this.http
      .post<AuthResponseData>(loginUrl, { username, password })
      .pipe(catchError(this.handleError));
  }

formatUser(data: AuthResponseData): User {
  const roleName = data.user.role?.name || 'unknown';
  return new User(
    data.user.UserId,
    data.user.UserCode,
    data.user.UserName,
    data.token,
    roleName
  );
}


  getErrorMessage(message: string): string {
    
    if (message.includes('Invalid credentials') || message.includes('Unauthorized')) {
      return 'Invalid username or password';
    }
    if (message.includes('network') || message.includes('Failed to fetch')) {
      return 'Network error. Please try again.';
    }
   
    return 'Unknown error occurred. Please try again.';
  }

 setUserInSessionStorage(user: User): void {
  sessionStorage.setItem('userData', JSON.stringify(user));
}

getUserFromSessionStorage(): User | null {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    return new User(
      userData.userId,
      userData.userCode,
      userData.userName,
      userData.token,
      userData.role
    );
  }
  return null;
}

logout(): void {
  sessionStorage.removeItem('userData');
}


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error.error || `Error Code: ${error.status}, Message: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}