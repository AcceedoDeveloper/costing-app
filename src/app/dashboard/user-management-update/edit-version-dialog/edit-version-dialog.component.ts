import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VersionService } from '../../../services/version.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-version-dialog',
  templateUrl: './edit-version-dialog.component.html',
  styleUrls: ['./edit-version-dialog.component.css']
})
export class EditVersionDialogComponent implements OnInit {
  editForm: FormGroup;
  isSubmitting = false;
  versionId: string;
  currentHeading: string;
  currentOldImage: string;
  currentNewImage: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private versionService: VersionService,
    private toastr: ToastrService
  ) {
    this.versionId = data.versionId || data.id || '';
    this.currentHeading = data.heading || data.title || '';
    this.currentOldImage = data.oldImage || '';
    this.currentNewImage = data.newImage || '';

    this.editForm = this.fb.group({
      heading: [this.currentHeading],
      oldImages: [null],
      newImages: [null]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event, fieldName: 'oldImages' | 'newImages'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.editForm.patchValue({
        [fieldName]: file
      });
      this.editForm.get(fieldName)?.updateValueAndValidity();
    }
  }

  getFileName(fieldName: 'oldImages' | 'newImages'): string {
    const file = this.editForm.get(fieldName)?.value;
    if (file) {
      return file.name;
    }
    // Return current image filename if no new file selected
    if (fieldName === 'oldImages' && this.currentOldImage) {
      const filename = this.currentOldImage.includes('/') 
        ? this.currentOldImage.split('/').pop() 
        : this.currentOldImage;
      return `Current: ${filename}`;
    }
    if (fieldName === 'newImages' && this.currentNewImage) {
      const filename = this.currentNewImage.includes('/') 
        ? this.currentNewImage.split('/').pop() 
        : this.currentNewImage;
      return `Current: ${filename}`;
    }
    return 'No file chosen';
  }

  hasChanges(): boolean {
    const formValue = this.editForm.value;
    const headingChanged = formValue.heading && formValue.heading.trim() !== this.currentHeading.trim();
    const oldImageChanged = formValue.oldImages !== null;
    const newImageChanged = formValue.newImages !== null;
    
    return headingChanged || oldImageChanged || newImageChanged;
  }

  onSubmit(): void {
    if (!this.hasChanges()) {
      this.toastr.warning('No changes detected');
      return;
    }

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.editForm.value;
    
    // Only send fields that have changed
    const heading = (formValue.heading && formValue.heading.trim() !== this.currentHeading.trim()) 
      ? formValue.heading.trim() 
      : undefined;
    const oldImages = formValue.oldImages || undefined;
    const newImages = formValue.newImages || undefined;

    this.versionService.updateVersion(
      this.versionId,
      heading,
      oldImages,
      newImages
    ).subscribe({
      next: (response) => {
        console.log('✅ Version updated successfully:', response);
        this.toastr.success('Version updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('❌ Error updating version:', error);
        this.toastr.error('Failed to update version');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

