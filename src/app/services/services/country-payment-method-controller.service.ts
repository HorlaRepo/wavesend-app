/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ApiResponseListPaymentMethod } from '../models/api-response-list-payment-method';
import { getPaymentMethodsByCountryAcronym1 } from '../fn/country-payment-method-controller/get-payment-methods-by-country-acronym-1';
import { GetPaymentMethodsByCountryAcronym1$Params } from '../fn/country-payment-method-controller/get-payment-methods-by-country-acronym-1';

@Injectable({ providedIn: 'root' })
export class CountryPaymentMethodControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getPaymentMethodsByCountryAcronym1()` */
  static readonly GetPaymentMethodsByCountryAcronym1Path = '/country-payment-method/{acronym}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getPaymentMethodsByCountryAcronym1()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPaymentMethodsByCountryAcronym1$Response(params: GetPaymentMethodsByCountryAcronym1$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseListPaymentMethod>> {
    return getPaymentMethodsByCountryAcronym1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getPaymentMethodsByCountryAcronym1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getPaymentMethodsByCountryAcronym1(params: GetPaymentMethodsByCountryAcronym1$Params, context?: HttpContext): Observable<ApiResponseListPaymentMethod> {
    return this.getPaymentMethodsByCountryAcronym1$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseListPaymentMethod>): ApiResponseListPaymentMethod => r.body)
    );
  }

}
