import { CustomSerializer } from './store/router/custom-serializer';
import { AuthTokenInterceptor } from './services/AuthToken.interceptor';
import { AuthEffects } from './auth/state/auth.effects';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { appReducer } from './store/app.state';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';


import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../src/environments/environment';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HeaderComponent} from './shared/components/header/header.component';
import { LoadingSpinnerComponent} from './shared/components/loading-spinner/loading-spinner.component';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';


import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';


import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';

import { MatDialogModule } from '@angular/material/dialog';


import { CommonModule } from '@angular/common';


import { ConfigService } from './shared/components/config.service';
export function initializeApp(configService: ConfigService) {
  return () => configService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,  
    LoadingSpinnerComponent,  MainLayoutComponent, AuthLayoutComponent, ConfirmDialogComponent, 
   
  ],
  imports: [
    CommonModule,
     MatDialogModule,
    RouterModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatCardModule,
    MatTooltipModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatSidenavModule,
    MatListModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    EffectsModule.forRoot([AuthEffects]),
    StoreModule.forRoot(appReducer),
     ToastrModule.forRoot({
      positionClass: 'toast-top-right', // 👈 This is the key line
      preventDuplicates: true
    }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
    StoreRouterConnectingModule.forRoot({
      serializer: CustomSerializer,
    }),
    BrowserAnimationsModule,
  ],
providers: [
  {
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [ConfigService],
    multi: true
  },
  { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
],

  bootstrap: [AppComponent],
 
})
export class AppModule {}
