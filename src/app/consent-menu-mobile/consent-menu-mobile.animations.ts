import {animate, style, transition, trigger} from '@angular/animations';

export const ConsentMenuMobileAnimations = {
  menuAppearance: trigger('menuAppearance',[
    transition(':enter', [style({
      bottom: '-100%'
    }), animate('.2s', style({
      bottom: '60px'
    }))]),
    transition(':leave', animate('.3s', style({
      bottom: '-100%'
    })))
  ])
};
