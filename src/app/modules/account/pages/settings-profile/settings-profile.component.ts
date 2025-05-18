import {Component, OnInit} from '@angular/core';
import { format } from 'date-fns';
import {UserInfo} from "../../../../services/keycloack/user-info";
import {KeycloakService} from "../../../../services/keycloack/keycloak.service";
import {UserProfile} from "../../../../services/keycloack/user-profile";

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.css']
})
export class SettingsProfileComponent implements OnInit{

  date: string = '';
  userInfo: UserInfo | undefined;
  userProfile: UserProfile | undefined;


  constructor(private keycloakService: KeycloakService) {

  }

  ngOnInit(): void {
    this.userInfo = this.keycloakService.userInfo;
    this.userProfile = this.keycloakService.profile;
    let dateOfBirth = this.userInfo?.dateOfBirth  as string;
    this.date = format(new Date(dateOfBirth), 'yyyy-MM-dd');
  }


  /**
 * Gets the formatted timezone string in the format "(GMT+/-HH:MM) Region Name"
 */
getFormattedTimezone(): string {
  // Get the timezone offset in minutes
  const offsetMinutes = new Date().getTimezoneOffset();
  
  // Convert to hours and minutes (offset is inverted in JavaScript)
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const offsetMinutesRemainder = Math.abs(offsetMinutes % 60);
  
  // Format the offset string with appropriate sign and padding
  const sign = offsetMinutes <= 0 ? '+' : '-'; // JS returns negative for east, positive for west
  const hoursStr = offsetHours.toString().padStart(2, '0');
  const minutesStr = offsetMinutesRemainder.toString().padStart(2, '0');
  
  // Get timezone name 
  const timezoneName = this.getTimezoneName();
  
  // Return the formatted string
  return `(GMT${sign}${hoursStr}:${minutesStr}) ${timezoneName}`;
}

/**
 * Gets a user-friendly timezone name based on the browser's timezone
 */
private getTimezoneName(): string {
  try {
    // Try to use Intl API to get timezone name
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Map of timezone IDs to friendly names
    const timezoneMap: {[key: string]: string} = {
      // North/South America
      'America/New_York': 'Eastern Time (US & Canada)',
      'America/Chicago': 'Central Time (US & Canada)',
      'America/Denver': 'Mountain Time (US & Canada)',
      'America/Los_Angeles': 'Pacific Time (US & Canada)',
      'America/Phoenix': 'Arizona',
      'America/Anchorage': 'Alaska',
      'America/Adak': 'Hawaii-Aleutian',
      'America/Honolulu': 'Hawaii',
      'America/Mexico_City': 'Central America',
      'America/Managua': 'Central America',
      'America/Bogota': 'Bogota, Lima',
      'America/Caracas': 'Caracas',
      'America/Santiago': 'Santiago',
      'America/Argentina/Buenos_Aires': 'Buenos Aires',
      'America/Sao_Paulo': 'Brasilia',
      
      // Europe/Africa
      'Europe/London': 'London, Edinburgh',
      'Europe/Berlin': 'Berlin, Paris, Rome',
      'Europe/Paris': 'Paris, Madrid',
      'Europe/Brussels': 'Brussels, Copenhagen',
      'Europe/Amsterdam': 'Amsterdam, Berlin',
      'Europe/Zurich': 'Zurich, Geneva',
      'Europe/Rome': 'Rome, Vienna',
      'Europe/Stockholm': 'Stockholm, Oslo',
      'Europe/Athens': 'Athens, Istanbul',
      'Europe/Moscow': 'Moscow, St. Petersburg',
      'Africa/Cairo': 'Cairo',
      'Africa/Johannesburg': 'Johannesburg',
      
      // Asia/Pacific
      'Asia/Dubai': 'Dubai, Abu Dhabi',
      'Asia/Karachi': 'Karachi, Islamabad',
      'Asia/Kolkata': 'New Delhi, Mumbai',
      'Asia/Kathmandu': 'Kathmandu',
      'Asia/Dhaka': 'Dhaka',
      'Asia/Yangon': 'Yangon',
      'Asia/Bangkok': 'Bangkok, Jakarta',
      'Asia/Singapore': 'Singapore, Kuala Lumpur',
      'Asia/Shanghai': 'Beijing, Shanghai',
      'Asia/Hong_Kong': 'Hong Kong',
      'Asia/Tokyo': 'Tokyo, Osaka',
      'Asia/Seoul': 'Seoul',
      'Australia/Adelaide': 'Adelaide',
      'Australia/Sydney': 'Sydney, Melbourne',
      'Pacific/Auckland': 'Auckland',
      'Pacific/Fiji': 'Fiji',
    };
    
    // If we have a mapping use it, otherwise extract the city name
    if (timezone && timezoneMap[timezone]) {
      return timezoneMap[timezone];
    } else if (timezone) {
      // Extract city name from timezone ID
      const parts = timezone.split('/');
      const city = parts[parts.length - 1].replace(/_/g, ' ');
      return city;
    }
  } catch (e) {
    console.error('Error getting timezone name:', e);
  }
  
  // Fallback to generic timezone name based on offset
  return this.getGenericTimezoneName(new Date().getTimezoneOffset());
}

/**
 * Fallback method to get a generic timezone name from offset
 */
private getGenericTimezoneName(offsetMinutes: number): string {
  // Common offset to region mappings
  const offsetMap: { [key: string]: string } = {
    '0': 'UTC',
    '60': 'Central European Time',
    '120': 'Eastern European Time',
    '180': 'Moscow Time',
    '300': 'Pakistan Time',
    '330': 'India Time',
    '480': 'China Time',
    '540': 'Japan Time',
    '600': 'Australian Eastern Time',
    '720': 'New Zealand Time',
    '-300': 'Eastern Time',
    '-360': 'Central Time',
    '-420': 'Mountain Time',
    '-480': 'Pacific Time',
    '-540': 'Alaska Time',
    '-600': 'Hawaii Time'
  };
  
  return offsetMap[offsetMinutes.toString()] || 'Local Time';
}

}

