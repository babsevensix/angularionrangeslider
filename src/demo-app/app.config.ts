import { ApplicationConfig } from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    // provideAnimationsAsync(),
    // provideRouter(routes, withComponentInputBinding()),
    // provideHttpClient(
    //   withInterceptors([
    //     // Ordine importante: prima baseUrl, poi auth, poi errorHandler
    //     baseUrlInterceptor,
    //     AuthInterceptor,
    //     errorHandlerInterceptor,
    //   ])
    // ),
    // providePrimeNG({
    //   theme: {
    //     preset: Aura,
    //     options: {
    //       darkModeSelector: '.dark-mode',
    //       cssLayer: {
    //         name: 'primeng',
    //         order: 'theme, base, primeng',
    //       },
    //     },
    //   },
    // }),
    // MessageService, // Aggiungiamo il provider globale per MessageService
    // { provide: LOCALE_ID, useValue: 'it-IT' }, // Set Italian as default locale
  ],
};
