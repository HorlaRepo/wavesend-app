import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: any;
  
  constructor(private http: HttpClient) { }
  
  loadConfig() {
    return this.http.get('./assets/config/config.json')
      .toPromise()
      .then(config => {
        this.config = config;
        return config;
      });
  }
  
  getConfig() {
    return this.config;
  }
}