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

import { ApiResponseListBeneficiaryAiSuggestion } from '../models/api-response-list-beneficiary-ai-suggestion';
import { ApiResponseString } from '../models/api-response-string';
import { dismissSuggestion } from '../fn/beneficiary-ai-suggestion-controller/dismiss-suggestion';
import { DismissSuggestion$Params } from '../fn/beneficiary-ai-suggestion-controller/dismiss-suggestion';
import { generateSuggestions } from '../fn/beneficiary-ai-suggestion-controller/generate-suggestions';
import { GenerateSuggestions$Params } from '../fn/beneficiary-ai-suggestion-controller/generate-suggestions';
import { getUserSuggestions } from '../fn/beneficiary-ai-suggestion-controller/get-user-suggestions';
import { GetUserSuggestions$Params } from '../fn/beneficiary-ai-suggestion-controller/get-user-suggestions';

@Injectable({ providedIn: 'root' })
export class BeneficiaryAiSuggestionControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `dismissSuggestion()` */
  static readonly DismissSuggestionPath = '/beneficiary/suggestions/{suggestionId}/dismiss';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `dismissSuggestion()` instead.
   *
   * This method doesn't expect any request body.
   */
  dismissSuggestion$Response(params: DismissSuggestion$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return dismissSuggestion(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `dismissSuggestion$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  dismissSuggestion(params: DismissSuggestion$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.dismissSuggestion$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `generateSuggestions()` */
  static readonly GenerateSuggestionsPath = '/beneficiary/suggestions/generate';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `generateSuggestions()` instead.
   *
   * This method doesn't expect any request body.
   */
  generateSuggestions$Response(params?: GenerateSuggestions$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return generateSuggestions(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `generateSuggestions$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  generateSuggestions(params?: GenerateSuggestions$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.generateSuggestions$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `getUserSuggestions()` */
  static readonly GetUserSuggestionsPath = '/beneficiary/suggestions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserSuggestions()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserSuggestions$Response(params?: GetUserSuggestions$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseListBeneficiaryAiSuggestion>> {
    return getUserSuggestions(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserSuggestions$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserSuggestions(params?: GetUserSuggestions$Params, context?: HttpContext): Observable<ApiResponseListBeneficiaryAiSuggestion> {
    return this.getUserSuggestions$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseListBeneficiaryAiSuggestion>): ApiResponseListBeneficiaryAiSuggestion => r.body)
    );
  }

}
