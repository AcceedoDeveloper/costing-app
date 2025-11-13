import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialComponent } from './material/material.component';
import { MaterialRoutingModule } from './material-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { materialReducer } from './store/material.reducer';
import { MATERIAL_STATE_NAME } from './store/material.selector';
import { EffectsModule } from '@ngrx/effects';
import { MaterialEffects } from './store/material.effects';
import { AddMaterialComponent } from './material/add-material/add-material.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SupplierComponent } from './supplier/supplier.component';
import { AddSupplierComponent } from './supplier/add-supplier/add-supplier.component';

import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatStepperModule } from '@angular/material/stepper';



import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CustomerdetailsComponent } from './customerdetails/customerdetails.component';
import { ProcessComponent } from './process/process.component';
import { AddprocessComponent } from './process/addprocess/addprocess.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GradeModule } from '../grade/grade.module';
import { MeterialtypeModule} from '../modules/materialinput/meterialinput.module';
import { MasterModule } from '../master/master/master.module';
import { MaterialtypeComponent } from './materialtype/materialtype.component';
import { ProcesseditComponent } from './process/processedit/processedit.component';
import { AddcustomerdetailsComponent } from './customerdetails/addcustomerdetails/addcustomerdetails.component'; 
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UpdateaddcustomerdDetailsComponent } from './customerdetails/updateaddcustomerd-details/updateaddcustomerd-details.component';
import { ProcessPowerComponent } from './process-power/process-power.component';
import { SalaryWagesComponent } from './salary-wages/salary-wages.component';
import { AddSalaryWagesComponent } from './salary-wages/add-salary-wages/add-salary-wages.component';
import { UpdateCustomerDetailsComponent } from './customerdetails/update-customer-details/update-customer-details.component';
import { SalaryWagesHistoryComponent } from './salary-wages-history/salary-wages-history.component';
import { ViewQuotationComponent } from './customerdetails/view-quotation/view-quotation.component';

@NgModule({
  declarations: [MaterialComponent, AddMaterialComponent, 
    SupplierComponent, AddSupplierComponent, CustomerdetailsComponent, 
    ProcessComponent, AddprocessComponent, MaterialtypeComponent, 
    ProcesseditComponent, AddcustomerdetailsComponent, 
    UpdateaddcustomerdDetailsComponent, ProcessPowerComponent, SalaryWagesComponent, AddSalaryWagesComponent, UpdateCustomerDetailsComponent, SalaryWagesHistoryComponent, ViewQuotationComponent],
  imports: [
    MatAutocompleteModule,
    MatTooltipModule,
     MatStepperModule ,
    GradeModule,
    MeterialtypeModule,
    MasterModule,
    MatCheckboxModule,
    FormsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
   
    CommonModule,
    MaterialRoutingModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    StoreModule.forFeature(MATERIAL_STATE_NAME, materialReducer),
    EffectsModule.forFeature([MaterialEffects]),
  ],
})
export class MaterialModule {}