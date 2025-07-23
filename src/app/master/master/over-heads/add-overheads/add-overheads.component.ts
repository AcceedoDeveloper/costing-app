import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { addOverhead, updateOverhead } from '../../store/master.action';
import { loadProcesses} from '../../../../material/store/material.actions';
import { getAllProcesses } from '../../../../material/store/material.selector';
import { Process } from '../../../../models/process.model';
import { Observable, Subscription } from 'rxjs';
import { loadOverheads } from '../../store/master.action';

@Component({
  selector: 'app-add-overheads',
  templateUrl: './add-overheads.component.html',
  styleUrls: ['./add-overheads.component.css']
})
export class AddOverheadsComponent implements OnInit {
  overheadForm!: FormGroup;
  isEditMode = false;
  recordId: string | null = null;



   processes: Process[] = [];
    processNames: string[] = [];
  
private subscriptions: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<AddOverheadsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {


     this.store.dispatch(loadProcesses());


    this.overheadForm = this.fb.group({
      processName: ['', Validators.required],
      repairAndMaintenance: [0, Validators.required],
      sellingDistributionAndMiscOverHeads: [0, Validators.required],
      financeCost: [0, Validators.required]
    });

    if (this.data) {
      this.isEditMode = true;
      this.overheadForm.patchValue(this.data);
      this.recordId = this.data._id;
    }

        this.subscriptions.add(
      this.store.select(getAllProcesses).subscribe((data: Process[]) => {
        this.processes = (data || []).filter(Boolean);
        this.processNames = this.processes.map(p => p.processName);
      })
    );
  }

  onSubmit() {
    if (this.overheadForm.valid) {
      const formData = this.overheadForm.value;

      if (this.isEditMode && this.recordId) {
        this.store.dispatch(updateOverhead({ id: this.recordId, overhead: formData }));

      } else {
        this.store.dispatch(addOverhead({ overhead: formData }));
      }

      this.dialogRef.close();
    }
  }
}
