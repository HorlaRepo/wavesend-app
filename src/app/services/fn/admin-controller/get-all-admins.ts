/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseListAdmin } from '../../models/api-response-list-admin';

export interface GetAllAdmins$Params {
}

export function getAllAdmins(http: HttpClient, rootUrl: string, params?: GetAllAdmins$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseListAdmin>> {
  const rb = new RequestBuilder(rootUrl, getAllAdmins.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseListAdmin>;
    })
  );
}

getAllAdmins.PATH = '/admin/admin';
