/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { BankResolverResponse } from '../../models/bank-resolver-response';

export interface ResolveBankAccount$Params {
  account_number: string;
  bank_code: string;
}

export function resolveBankAccount(http: HttpClient, rootUrl: string, params: ResolveBankAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<BankResolverResponse>> {
  const rb = new RequestBuilder(rootUrl, resolveBankAccount.PATH, 'get');
  if (params) {
    rb.query('account_number', params.account_number, {});
    rb.query('bank_code', params.bank_code, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<BankResolverResponse>;
    })
  );
}

resolveBankAccount.PATH = '/paystack/resolve';
