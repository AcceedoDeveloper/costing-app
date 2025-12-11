import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { VersionService } from '../../../services/version.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-version-dialog',
  templateUrl: './create-version-dialog.component.html',
  styleUrls: ['./create-version-dialog.component.css']
})
export class CreateVersionDialogComponent implements OnInit {
  versionForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateVersionDialogComponent>,
    private versionService: VersionService,
    private toastr: ToastrService
  ) {
    this.versionForm = this.fb.group({
      heading: ['', Validators.required],
      oldImages: [null, Validators.required],
      newImages: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event, fieldName: 'oldImages' | 'newImages'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.versionForm.patchValue({
        [fieldName]: file
      });
      this.versionForm.get(fieldName)?.updateValueAndValidity();
    }
  }

  getFileName(fieldName: 'oldImages' | 'newImages'): string {
    const file = this.versionForm.get(fieldName)?.value;
    return file ? file.name : 'No file chosen';
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    Object.keys(this.versionForm.controls).forEach(key => {
      this.versionForm.get(key)?.markAsTouched();
    });

    if (this.versionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.versionForm.value;
      
      this.versionService.createVersion(
        formValue.heading,
        formValue.oldImages,
        formValue.newImages
      ).subscribe({
        next: (response) => {
          console.log('✅ Version created successfully:', response);
          this.toastr.success('Version created successfully');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('❌ Error creating version:', error);
          this.toastr.error('Failed to create version');
          this.isSubmitting = false;
        }
      });
    } else {
      this.toastr.warning('Please fill in all required fields');
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

