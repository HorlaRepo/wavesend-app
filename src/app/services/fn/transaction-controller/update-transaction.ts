/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseTransactionResponse } from '../../models/api-response-transaction-response';
import { TransactionStatusDto } from '../../models/transaction-status-dto';

export interface UpdateTransaction$Params {
  id: number;
      body: TransactionStatusDto
}

export function updateTransaction(http: HttpClient, rootUrl: string, params: UpdateTransaction$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseTransactionResponse>> {
  const rb = new RequestBuilder(rootUrl, updateTransaction.PATH, 'put');
  if (params) {
    rb.path('id', params.id, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseTransactionResponse>;
    })
  );
}

updateTransaction.PATH = '/transactions/update/{id}';
