import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

interface Country {
  name: {
    common: string;
    official: string;
    nativeName?: {
      [key: string]: {
        official: string;
        common: string;
      }
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name';


  constructor(private http: HttpClient) { }

  getCountriesCommonNames(): Observable<string[]> {
    return this.http.get<Country[]>(this.apiUrl).pipe(
      map((countries: Country[]) =>
        countries.map(country => country.name.common).sort((a, b) => a.localeCompare(b))
      )
    );
  }
}
