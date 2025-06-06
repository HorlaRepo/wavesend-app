/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseBankAccount } from '../../models/api-response-bank-account';

export interface GetBankAccountByAccountNumber$Params {
  accountNumber: string;
}

export function getBankAccountByAccountNumber(http: HttpClient, rootUrl: string, params: GetBankAccountByAccountNumber$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseBankAccount>> {
  const rb = new RequestBuilder(rootUrl, getBankAccountByAccountNumber.PATH, 'get');
  if (params) {
    rb.path('accountNumber', params.accountNumber, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseBankAccount>;
    })
  );
}

getBankAccountByAccountNumber.PATH = '/bank-account/{accountNumber}';
