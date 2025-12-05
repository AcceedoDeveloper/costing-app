import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createVersion(heading: string, oldImages: File, newImages: File): Observable<any> {
    const formData = new FormData();
    formData.append('heading', heading);
    formData.append('oldImages', oldImages, oldImages.name);
    formData.append('newImages', newImages, newImages.name);

    const url = `${this.apiUrl}/createVersions`;
    console.log('📤 Creating version:', { heading, oldImages: oldImages.name, newImages: newImages.name });
    
    return this.http.post<any>(url, formData, {
      reportProgress: false,
      observe: 'body'
    });
  }

  getVersions(): Observable<any> {
    const url = `${this.apiUrl}/getVersions`;
    console.log('📥 Fetching versions from:', url);
    
    return this.http.get<any>(url);
  }

  updateVersion(id: string, heading?: string, oldImages?: File, newImages?: File): Observable<any> {
    const formData = new FormData();
    
    // Only append heading if it's provided and not empty
    if (heading !== undefined && heading !== null && heading.trim() !== '') {
      formData.append('heading', heading.trim());
    }
    
    // Only append files if they are provided
    if (oldImages) {
      formData.append('oldImages', oldImages, oldImages.name);
    }
    if (newImages) {
      formData.append('newImages', newImages, newImages.name);
    }

    const url = `${this.apiUrl}/updateVersions/${id}`;
    console.log('📝 Updating version:', { 
      id, 
      heading: heading ? heading : 'not sent',
      oldImages: oldImages ? oldImages.name : 'not sent',
      newImages: newImages ? newImages.name : 'not sent',
      formDataKeys: Array.from((formData as any).keys())
    });
    
    return this.http.put<any>(url, formData, {
      reportProgress: false,
      observe: 'body'
    });
  }

  deleteVersion(id: string): Observable<any> {
    const url = `${this.apiUrl}/deleteVersions/${id}`;
    console.log('🗑️ Deleting version:', { id, url });
    
    return this.http.delete<any>(url);
  }
}

