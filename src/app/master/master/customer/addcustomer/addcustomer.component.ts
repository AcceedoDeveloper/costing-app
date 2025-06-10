import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Customer } from '../../../../models/Customer-details.model';
import { addCustomer } from '../../store/master.action';
import { updateCustomer } from '../../store/master.action';

@Component({
  selector: 'app-addcustomer',
  templateUrl: './addcustomer.component.html',
  styleUrls: ['./addcustomer.component.css']
})
export class AddcustomerComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  editCustomerId: string | undefined;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddcustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer?: Customer }
  ) {
    // Initialize the form with validators
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phoneNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });

    // If data is provided, switch to edit mode and patch form values
    if (data?.customer) {
      this.isEditMode = true;
      this.editCustomerId = data.customer._id;
      this.customerForm.patchValue({
        name: data.customer.name,
        address: data.customer.address,
        phoneNo: data.customer.phoneNo,
      });
    }
  }

  ngOnInit(): void {}

  submitCustomer(): void {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.value;
      let customer: Customer;

      if (this.isEditMode && this.editCustomerId) {
     
        customer = {
          _id: this.editCustomerId,
          name: formValue.name,
          lowerCaseName: formValue.name.toLowerCase(),
          address: formValue.address,
          phoneNo: formValue.phoneNo,
          __v: this.data.customer?.__v ?? 0,
        };
        console.log('Dispatching updateCustomer with:', customer);
this.store.dispatch(updateCustomer({ id: this.editCustomerId, data: customer }));
            } else {
              
              const data = formValue;
       
        console.log('Dispatching createCustomer with:', data );
            this.store.dispatch(addCustomer({ customer: data }));

      }

      this.dialogRef.close();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}