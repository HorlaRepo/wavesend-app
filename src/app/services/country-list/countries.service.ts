import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// Updated interface to match the new API response format
interface Country {
  name: string;
  iso2: string;
  iso3: string;
  unicodeFlag: string;
}

// Added interface for the API response wrapper
interface CountriesApiResponse {
  error: boolean;
  msg: string;
  data: Country[];
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private apiUrl = 'https://countriesnow.space/api/v0.1/countries/flag/unicode';

  constructor(private http: HttpClient) { }

  getCountriesCommonNames(): Observable<string[]> {
    return this.http.get<CountriesApiResponse>(this.apiUrl).pipe(
      map((response: CountriesApiResponse) => 
        // Extract just the names from the data array and sort them
        response.data.map(country => country.name).sort((a, b) => a.localeCompare(b))
      )
    );
  }
}