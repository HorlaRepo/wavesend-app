// statement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatementService {
  private apiBaseUrl = 'http://localhost:8080';
  constructor(private http: HttpClient) {}

  generateStatement(start: string, end: string, format: string): Observable<Blob> {
    const url = `${this.apiBaseUrl}/api/v1/statements/generate?start=${start}&end=${end}&format=${format}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
