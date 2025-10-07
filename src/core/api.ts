import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Auth endpoints
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile`, data);
  }

  contactUs(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact`, data);
  }
}
