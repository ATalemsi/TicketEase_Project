import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MetaReducer, provideStore} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient, withInterceptors, withFetch } from "@angular/common/http";
import { authInterceptor } from "./core/http/http-interceptor.service";
import { AuthEffects } from "./features/auth/store/auth.effects";
import { authReducer } from "./features/auth/store/auth.reducer";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import {ticketReducer} from "./features/tickets/store/ticket.reducer";
import {TicketEffects} from "./features/tickets/store/ticket.effects";
import {localStorageSync} from "ngrx-store-localstorage";
import {agentReducer} from "./features/agent/store/agent.reducer";
import {AgentEffects} from "./features/agent/store/agent.effects";
import {adminReducer} from "./features/admin/store/admin.reducer";
import {AdminEffects} from "./features/admin/store/admin.effects";

export function localStorageSyncReducer(reducer: any): any {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);
  }
  return reducer; // Return the original reducer if localStorage is not available
}

const metaReducers: MetaReducer[] = [localStorageSyncReducer];
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])), // Add withFetch() here
    provideClientHydration(),
    provideAnimationsAsync(),
    provideStore({ auth: authReducer , tickets: ticketReducer , agent: agentReducer , admin:adminReducer } ,  { metaReducers }),
    provideEffects([AuthEffects , TicketEffects , AgentEffects , AdminEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};
