/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GenericResponseWithdrawalData } from '../../models/generic-response-withdrawal-data';
import { WithdrawalVerificationRequest } from '../../models/withdrawal-verification-request';

export interface VerifyAndWithdraw$Params {
      body: WithdrawalVerificationRequest
}

export function verifyAndWithdraw(http: HttpClient, rootUrl: string, params: VerifyAndWithdraw$Params, context?: HttpContext): Observable<StrictHttpResponse<GenericResponseWithdrawalData>> {
  const rb = new RequestBuilder(rootUrl, verifyAndWithdraw.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<GenericResponseWithdrawalData>;
    })
  );
}

verifyAndWithdraw.PATH = '/withdrawals/verify';
