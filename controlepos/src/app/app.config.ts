import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http'; 
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Firebase
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // Firestore
import { environment } from '../environments/environment'; // Environment

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Firebase App
    provideFirestore(() => getFirestore()) // Firestore
  ]
};
