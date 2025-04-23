/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseJwtResponseDto } from '../../models/api-response-jwt-response-dto';
import { AuthRequestDto } from '../../models/auth-request-dto';

export interface AuthenticateAndGetToken$Params {
      body: AuthRequestDto
}

export function authenticateAndGetToken(http: HttpClient, rootUrl: string, params: AuthenticateAndGetToken$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseJwtResponseDto>> {
  const rb = new RequestBuilder(rootUrl, authenticateAndGetToken.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseJwtResponseDto>;
    })
  );
}

authenticateAndGetToken.PATH = '/auth/login';
