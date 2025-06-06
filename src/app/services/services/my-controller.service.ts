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

import { getAuthUser } from '../fn/my-controller/get-auth-user';
import { GetAuthUser$Params } from '../fn/my-controller/get-auth-user';

@Injectable({ providedIn: 'root' })
export class MyControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getAuthUser()` */
  static readonly GetAuthUserPath = '/auth-user';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAuthUser()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAuthUser$Response(params?: GetAuthUser$Params, context?: HttpContext): Observable<StrictHttpResponse<string>> {
    return getAuthUser(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAuthUser$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAuthUser(params?: GetAuthUser$Params, context?: HttpContext): Observable<string> {
    return this.getAuthUser$Response(params, context).pipe(
      map((r: StrictHttpResponse<string>): string => r.body)
    );
  }

}
