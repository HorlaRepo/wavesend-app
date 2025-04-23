/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseUser } from '../../models/api-response-user';

export interface GetUser$Params {
  id: number;
}

export function getUser(http: HttpClient, rootUrl: string, params: GetUser$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseUser>> {
  const rb = new RequestBuilder(rootUrl, getUser.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseUser>;
    })
  );
}

getUser.PATH = '/users/{id}';
