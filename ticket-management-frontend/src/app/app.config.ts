import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient, withInterceptors, withFetch } from "@angular/common/http";
import { authInterceptor } from "./core/http/http-interceptor.service";
import { AuthEffects } from "./features/auth/store/auth.effects";
import { authReducer } from "./features/auth/store/auth.reducer";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import {ticketReducer} from "./features/tickets/store/ticket.reducer";
import {TicketEffects} from "./features/tickets/store/ticket.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), // Add withFetch() here
    provideClientHydration(),
    provideAnimationsAsync(),
    provideStore({ auth: authReducer , ticket: ticketReducer }),
    provideEffects([AuthEffects , TicketEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};
