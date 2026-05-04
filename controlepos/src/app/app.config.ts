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
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
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
