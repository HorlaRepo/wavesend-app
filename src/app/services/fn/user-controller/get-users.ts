/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseListUser } from '../../models/api-response-list-user';

export interface GetUsers$Params {
  page?: number;
  pageSize?: number;
}

export function getUsers(http: HttpClient, rootUrl: string, params?: GetUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseListUser>> {
  const rb = new RequestBuilder(rootUrl, getUsers.PATH, 'get');
  if (params) {
    rb.query('page', params.page, {});
    rb.query('pageSize', params.pageSize, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseListUser>;
    })
  );
}

getUsers.PATH = '/users';
