import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = 'localhost:3000';

  constructor(private http: HttpClient) {}

  // auth endpoints
  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  me() {
    return this.http.get(`${this.baseUrl}/me`);
  }

  updateProfile(data: any) {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }
  
}
