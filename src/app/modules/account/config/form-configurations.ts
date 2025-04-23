// src/app/config/form-configurations.ts

import { FormConfigurations } from './form-configurations.interface';

export const formConfigurations: FormConfigurations = {
  Nigeria: [
    { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
    { name: 'bankName', type: 'select', label: 'Bank Name', optionsSource: 'banks' },
    { name: 'ifscCode', type: 'text', label: 'Bank Code' },
    { name: 'accountName', type: 'text', label: 'Account Name', disabled: true },
    { name: 'isConfirmed', type: 'checkbox', label: 'I confirm the bank account details above' }
  ],
  USA: [
    { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
    { name: 'routingNumber', type: 'text', label: 'Routing Number' },
    { name: 'swiftCode', type: 'text', label: 'Swift Code' },
    { name: 'bankName', type: 'select', label: 'Bank Name', optionsSource: 'banks' },
    { name: 'beneficiaryName', type: 'text', label: 'Beneficiary Name' },
    { name: 'beneficiaryAddress', type: 'text', label: 'Beneficiary Address' }
  ],
  EU: [
    { name: 'accountNumber', type: 'text', label: 'Account Number', placeholder: 'e.g. 123466789000' },
    { name: 'routingNumber', type: 'text', label: 'Routing Number' },
    { name: 'swiftCode', type: 'text', label: 'Swift Code' },
    { name: 'bankName', type: 'text', label: 'Bank Name' },
    { name: 'beneficiaryName', type: 'text', label: 'Beneficiary Name' },
    { name: 'beneficiaryCountry', type: 'text', label: 'Beneficiary Country' },
    { name: 'postalCode', type: 'text', label: 'Postal Code' },
    { name: 'streetNumber', type: 'text', label: 'Street Number' },
    { name: 'streetName', type: 'text', label: 'Street Name' },
    { name: 'city', type: 'text', label: 'City' }
  ]
};
