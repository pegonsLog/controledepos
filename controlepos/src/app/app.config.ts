import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; 
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Firebase
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // Firestore
import { environment } from '../environments/environment'; // Environment
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_FORMATS, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

export const PT_BR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Firebase App
    provideFirestore(() => getFirestore()), // Firestore
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS }
  ]
};
