// animations.ts
import { trigger, state, style, transition, animate } from '@angular/animations';

export const slideAnimation = trigger('slideAnimation', [
  state('void', style({ transform: 'translateY(100%)' })),
  state('*', style({ transform: 'translateY(0)' })),
  transition(':enter', animate('300ms ease-out')),
  transition(':leave', animate('300ms ease-in'))
]);