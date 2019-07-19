import {animate, style, transition, trigger} from '@angular/animations';

export const NavbarAnimations = {
  arrowAppearance: trigger('arrowAppearance', [
    transition(':enter', [
        style({
          visibility: 'hidden'
        }),
        animate('.3s', style({'visibility': 'hidden'}))
      ]
    ),
    transition(':leave', animate('0s', style({
      visibility: 'hidden'
    })))
  ]),
  inboxAppearance: trigger('inboxAppearance', [
    transition(':enter', animate('0s', style({
      opacity: '1',
    }))),
    transition(':leave', animate('.3s', style({
      opacity: '0',
    })))
  ])
};
