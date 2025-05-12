import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterComponent } from './master/master.component';
import { MasterRoutingModule } from '../master-routing.module';
import { AdduserComponent } from './master/adduser/adduser.component';
import { MatDialogModule } from '@angular/material/dialog';
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
    MasterRoutingModule,
    StoreModule.forFeature(USER_STATE_NAME, userReducer),
    EffectsModule.forFeature([UserEffects]),
    ToastrModule,
  ]
})
export class MasterModule {}
