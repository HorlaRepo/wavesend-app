/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseString } from '../../models/api-response-string';

export interface ActivateAccount$Params {
  token: string;
}

export function activateAccount(http: HttpClient, rootUrl: string, params: ActivateAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
  const rb = new RequestBuilder(rootUrl, activateAccount.PATH, 'get');
  if (params) {
    rb.query('token', params.token, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseString>;
    })
  );
}

activateAccount.PATH = '/auth/activate-account';
