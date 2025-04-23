/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AdminRegistrationRequestBody } from '../../models/admin-registration-request-body';
import { ApiResponseString } from '../../models/api-response-string';

export interface AddAdmin$Params {
      body: AdminRegistrationRequestBody
}

export function addAdmin(http: HttpClient, rootUrl: string, params: AddAdmin$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
  const rb = new RequestBuilder(rootUrl, addAdmin.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

addAdmin.PATH = '/auth/admin/register';
