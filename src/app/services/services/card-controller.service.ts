/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ApiResponseCard } from '../models/api-response-card';
import { ApiResponseListCard } from '../models/api-response-list-card';
import { ApiResponseString } from '../models/api-response-string';
import { deleteCard } from '../fn/card-controller/delete-card';
import { DeleteCard$Params } from '../fn/card-controller/delete-card';
import { findCardByWalletId } from '../fn/card-controller/find-card-by-wallet-id';
import { FindCardByWalletId$Params } from '../fn/card-controller/find-card-by-wallet-id';
import { generateCard } from '../fn/card-controller/generate-card';
import { GenerateCard$Params } from '../fn/card-controller/generate-card';
import { lockCard } from '../fn/card-controller/lock-card';
import { LockCard$Params } from '../fn/card-controller/lock-card';
import { setCardPin } from '../fn/card-controller/set-card-pin';
import { SetCardPin$Params } from '../fn/card-controller/set-card-pin';
import { unlockCard } from '../fn/card-controller/unlock-card';
import { UnlockCard$Params } from '../fn/card-controller/unlock-card';
import { verifyPin } from '../fn/card-controller/verify-pin';
import { VerifyPin$Params } from '../fn/card-controller/verify-pin';

@Injectable({ providedIn: 'root' })
export class CardControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `setCardPin()` */
  static readonly SetCardPinPath = '/card/set-pin/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `setCardPin()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  setCardPin$Response(params: SetCardPin$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return setCardPin(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `setCardPin$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  setCardPin(params: SetCardPin$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.setCardPin$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `verifyPin()` */
  static readonly VerifyPinPath = '/card/verify-pin/{cardId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `verifyPin()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  verifyPin$Response(params: VerifyPin$Params, context?: HttpContext): Observable<StrictHttpResponse<boolean>> {
    return verifyPin(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `verifyPin$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  verifyPin(params: VerifyPin$Params, context?: HttpContext): Observable<boolean> {
    return this.verifyPin$Response(params, context).pipe(
      map((r: StrictHttpResponse<boolean>): boolean => r.body)
    );
  }

  /** Path part for operation `unlockCard()` */
  static readonly UnlockCardPath = '/card/unlock/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `unlockCard()` instead.
   *
   * This method doesn't expect any request body.
   */
  unlockCard$Response(params: UnlockCard$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return unlockCard(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `unlockCard$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  unlockCard(params: UnlockCard$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.unlockCard$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `lockCard()` */
  static readonly LockCardPath = '/card/lock/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `lockCard()` instead.
   *
   * This method doesn't expect any request body.
   */
  lockCard$Response(params: LockCard$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return lockCard(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `lockCard$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  lockCard(params: LockCard$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.lockCard$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `generateCard()` */
  static readonly GenerateCardPath = '/card/generate';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `generateCard()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateCard$Response(params: GenerateCard$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseCard>> {
    return generateCard(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `generateCard$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateCard(params: GenerateCard$Params, context?: HttpContext): Observable<ApiResponseCard> {
    return this.generateCard$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseCard>): ApiResponseCard => r.body)
    );
  }

  /** Path part for operation `findCardByWalletId()` */
  static readonly FindCardByWalletIdPath = '/card/{walletId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `findCardByWalletId()` instead.
   *
   * This method doesn't expect any request body.
   */
  findCardByWalletId$Response(params: FindCardByWalletId$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseListCard>> {
    return findCardByWalletId(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `findCardByWalletId$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  findCardByWalletId(params: FindCardByWalletId$Params, context?: HttpContext): Observable<ApiResponseListCard> {
    return this.findCardByWalletId$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseListCard>): ApiResponseListCard => r.body)
    );
  }

  /** Path part for operation `deleteCard()` */
  static readonly DeleteCardPath = '/card/delete/{cardId}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteCard()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteCard$Response(params: DeleteCard$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return deleteCard(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteCard$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteCard(params: DeleteCard$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.deleteCard$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

}
