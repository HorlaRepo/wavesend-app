/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseTransferInitiationResponse } from '../../models/api-response-transfer-initiation-response';
import { CreateTransactionRequestBody } from '../../models/create-transaction-request-body';

export interface InitiateTransfer$Params {
      body: CreateTransactionRequestBody
}

export function initiateTransfer(http: HttpClient, rootUrl: string, params: InitiateTransfer$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseTransferInitiationResponse>> {
  const rb = new RequestBuilder(rootUrl, initiateTransfer.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseTransferInitiationResponse>;
    })
  );
}

initiateTransfer.PATH = '/transfers/initiate';
