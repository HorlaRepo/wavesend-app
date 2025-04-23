import {ValidatorFn} from "@angular/forms";

export interface FormField {
  name: string;
  type: 'text' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  optionsSource?: string;
  disabled?: boolean;
}

export interface FormConfigurations {
  [key: string]: FormField[];
}



export interface Validation {
  name: string;
  value?: any;
}

