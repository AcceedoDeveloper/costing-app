import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { OverHead } from '../../../models/over-head.model';
import { getAccountTypes} from '../store/master.selector';
import { addAccountType } from '../store/master.action';
import { loadAccountTypes} from '../store/master.action';
import { deleteAccountType } from '../store/master.action';
import { updateAccountType} from '../store/master.action';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent} from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-over-heads',
  templateUrl: './over-heads.component.html',
  styleUrls: ['./over-heads.component.css']
})
export class OverHeadsComponent  {
  overhead: OverHead[] = [];
  accountTypes$: Observable<OverHead[]>;
  newOverHeadName: string = '';
  newOverHeadCode: number | null = null;
  isEditMode: boolean = false;
  currentEditId: string | null | undefined = null;

  constructor(private store: Store,  private dialog: MatDialog) {}

  ngOnInit() {
    this.store.dispatch(loadAccountTypes());
    this.accountTypes$ = this.store.select(getAccountTypes);
    this.accountTypes$.subscribe(data => {
      this.overhead = data || [];
      console.log('Loaded overhead:', this.overhead);
    });
  }


addOverHead() {
  if (this.newOverHeadCode === null) return; // stop if code is null

  const payload: OverHead = {
    name: this.newOverHeadName.trim(),
    code: this.newOverHeadCode
  };

  this.store.dispatch(addAccountType({ account: payload }));
  this.newOverHeadName = '';
  this.newOverHeadCode = null;
}


  deleteOverHead(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this overhead?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.store.dispatch(deleteAccountType({ id }));
        this.cancelAction();
      }
    });
  }

  cancelAction() {
    this.isEditMode = false;
    this.newOverHeadName = '';
    this.newOverHeadCode = null;
    this.currentEditId = null;
  }


   startEdit(item: OverHead) {
    this.isEditMode = true;
    this.newOverHeadName = item.name;
    this.newOverHeadCode = item.code;
    this.currentEditId = item._id; 
  }

 updateOverHead() {
  if (!this.currentEditId || this.newOverHeadCode === null) return;

  const updated = {
    _id: this.currentEditId,
    name: this.newOverHeadName.trim(),
    code: this.newOverHeadCode  // ✅ Now guaranteed to be a number
  };

  this.store.dispatch(updateAccountType({
    id: updated._id,
    account: {
      name: updated.name,
      code: updated.code
    }
  }));

  this.cancelAction();
}


}