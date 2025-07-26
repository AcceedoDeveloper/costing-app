import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState } from '../../store/app.state';
import { setLoadingSpinner } from '../../store/Shared/shared.actions';
import { loginStart } from '../state/auth.actions';
import { isAuthenticated, getErrorMessage } from '../state/auth.selector';
import { AuthService } from '../../services/auth.service';
import { getLoading } from '../../store/Shared/shared.selector';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false; // Explicitly declare and initializ
  private authSubscription: Subscription;
  private errorSubscription: Subscription;
  private loadingSubscription: Subscription;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private authService: AuthService
  ) {
    this.authSubscription = new Subscription();
    this.errorSubscription = new Subscription();
    this.loadingSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.authSubscription = this.store.select(isAuthenticated).subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard/dashh']);
      }
    });

    this.errorSubscription = this.store.select(getErrorMessage).subscribe((error) => {
      console.log('Component received error:', error); 
      this.errorMessage = error ? this.authService.getErrorMessage(error) : null;
    });

    this.loadingSubscription = this.store.select(getLoading).subscribe((loading) => {
      console.log('Loading state:', loading);
      this.isLoading = loading;
    });
    
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage = null;
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    console.log('Login form submitted:', this.loginForm.value);
    this.store.dispatch(setLoadingSpinner({ status: true }));
    this.store.dispatch(loginStart({ username, password }));
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
}