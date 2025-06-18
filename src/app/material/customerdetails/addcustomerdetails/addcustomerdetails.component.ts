import { Component, OnInit } from '@angular/core';
import {loadCustomers } from '../../../master/master/store/master.action'
import { selectCustomers } from '../../../master/master/store/master.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-addcustomerdetails',
  templateUrl: './addcustomerdetails.component.html',
  styleUrls: ['./addcustomerdetails.component.css']
})
export class AddcustomerdetailsComponent implements OnInit {
  customer$ : Observable<any>;
  customer: any[] = [];

  constructor(private store: Store, ) { }

  ngOnInit(): void {
    this.store.dispatch(loadCustomers());

    this.customer$ = this.store.select(selectCustomers);

    this.customer$.subscribe(customer =>{
      this.customer = customer;
      console.log(customer);
    })

  }

}
