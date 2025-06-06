/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseUserRepresentation } from '../../models/api-response-user-representation';

export interface CheckUser$Params {
  email: string;
}

export function checkUser(http: HttpClient, rootUrl: string, params: CheckUser$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseUserRepresentation>> {
  const rb = new RequestBuilder(rootUrl, checkUser.PATH, 'get');
  if (params) {
    rb.query('email', params.email, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseUserRepresentation>;
    })
  );
}

checkUser.PATH = '/keycloak/check-user';
