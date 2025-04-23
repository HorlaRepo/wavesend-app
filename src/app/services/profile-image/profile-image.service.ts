import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProfileImageService {
  private profileImageUrlSubject = new BehaviorSubject<string>('assets/images/user-profile.png');
  profileImageUrl$ = this.profileImageUrlSubject.asObservable();

  setProfileImageUrl(url: string) {
    this.profileImageUrlSubject.next(url);
  }

  getProfileImageUrl(): string {
    return this.profileImageUrlSubject.value;
  }

  constructor() { }
}
