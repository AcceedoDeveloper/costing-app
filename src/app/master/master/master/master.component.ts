import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdduserComponent} from './adduser/adduser.component';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {

  constructor(private dialog: MatDialog) {
    
  }

  ngOnInit(): void {
  }

  openAddUserPopup() {
    this.dialog.open(AdduserComponent, {
      width: '400px',
    });
  }

}
