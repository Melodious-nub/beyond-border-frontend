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

  // admin endpoints
  // contact responses management
  getAllContactResponses(page: number = 1, pageSize: number = 20): Observable<any> {
    return this.http.get(`${this.baseUrl}/contact?page=${page}&pageSize=${pageSize}`);
  }

  // email notification management
  addEmailForNotification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/emails`, data);
  }

  getAllEmailsForNotification(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/emails`);
  }

  deleteEmailForNotification(email: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notifications/emails/${email}`);
  }

  testEmailNotification(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/send`, data);
  }
}
