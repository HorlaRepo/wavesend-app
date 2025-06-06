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

import { ApiResponseString } from '../models/api-response-string';
import { getUserProfileImage } from '../fn/user-profile-image-controller/get-user-profile-image';
import { GetUserProfileImage$Params } from '../fn/user-profile-image-controller/get-user-profile-image';
import { getUserProfileImageUrl } from '../fn/user-profile-image-controller/get-user-profile-image-url';
import { GetUserProfileImageUrl$Params } from '../fn/user-profile-image-controller/get-user-profile-image-url';
import { uploadUserProfileImage } from '../fn/user-profile-image-controller/upload-user-profile-image';
import { UploadUserProfileImage$Params } from '../fn/user-profile-image-controller/upload-user-profile-image';

@Injectable({ providedIn: 'root' })
export class UserProfileImageControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `uploadUserProfileImage()` */
  static readonly UploadUserProfileImagePath = '/user-profile-image/upload';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `uploadUserProfileImage()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  uploadUserProfileImage$Response(params?: UploadUserProfileImage$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return uploadUserProfileImage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `uploadUserProfileImage$Response()` instead.
   *
   * This method sends `multipart/form-data` and handles request body of type `multipart/form-data`.
   */
  uploadUserProfileImage(params?: UploadUserProfileImage$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.uploadUserProfileImage$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `getUserProfileImageUrl()` */
  static readonly GetUserProfileImageUrlPath = '/user-profile-image/url';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserProfileImageUrl()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserProfileImageUrl$Response(params?: GetUserProfileImageUrl$Params, context?: HttpContext): Observable<StrictHttpResponse<ApiResponseString>> {
    return getUserProfileImageUrl(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserProfileImageUrl$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserProfileImageUrl(params?: GetUserProfileImageUrl$Params, context?: HttpContext): Observable<ApiResponseString> {
    return this.getUserProfileImageUrl$Response(params, context).pipe(
      map((r: StrictHttpResponse<ApiResponseString>): ApiResponseString => r.body)
    );
  }

  /** Path part for operation `getUserProfileImage()` */
  static readonly GetUserProfileImagePath = '/user-profile-image/get';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserProfileImage()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserProfileImage$Response(params?: GetUserProfileImage$Params, context?: HttpContext): Observable<StrictHttpResponse<string>> {
    return getUserProfileImage(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserProfileImage$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserProfileImage(params?: GetUserProfileImage$Params, context?: HttpContext): Observable<string> {
    return this.getUserProfileImage$Response(params, context).pipe(
      map((r: StrictHttpResponse<string>): string => r.body)
    );
  }

}
