/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ApiResponseScheduledTransferResponseDto } from '../../models/api-response-scheduled-transfer-response-dto';
import { ScheduledTransferVerificationRequest } from '../../models/scheduled-transfer-verification-request';

export interface VerifyAndScheduleTransfer$Params {
      body: ScheduledTransferVerificationRequest
}

export function verifyAndScheduleTransfer(http: HttpClient, rootUrl: string, params: VerifyAndScheduleTransfer$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseScheduledTransferResponseDto>> {
  const rb = new RequestBuilder(rootUrl, verifyAndScheduleTransfer.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ApiResponseScheduledTransferResponseDto>;
    })
  );
}

verifyAndScheduleTransfer.PATH = '/scheduled-transfers/verify';
