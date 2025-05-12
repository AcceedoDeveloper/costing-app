import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterComponent } from './master/master.component';
import { MasterRoutingModule } from '../master-routing.module';
import { AdduserComponent } from './master/adduser/adduser.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { userReducer } from './store/master.reducer';
import { UserEffects } from './store/master.effects';
import { USER_STATE_NAME } from './store/master.selector';

@NgModule({
  declarations: [MasterComponent, AdduserComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MasterRoutingModule,
    StoreModule.forFeature(USER_STATE_NAME, userReducer),
    EffectsModule.forFeature([UserEffects]),
    ToastrModule,
  ]
})
export class MasterModule {}