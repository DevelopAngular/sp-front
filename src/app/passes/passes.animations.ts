import {animate, query, state, style, transition, trigger} from '@angular/animations';

export const PassesAnimations =  {
  OpenOrCloseRequests: trigger('OpenOrCloseRequests', [
      state('Opened', style({
        display: 'block',
        width: '351px',
        opacity: 1,
        // transform: 'translateX(0px)',
        'margin-right': '0px',

      })),
      state('Closed', style({
        display: 'none',
        width: '351px',
        opacity: 0,
        'margin-right': '-351px'
        // transform: 'translateX(50px)',
      })),

      transition('Opened => Closed', [
        animate('.5s 0s ease',  style({
          width: '351px',
          opacity: 0,
          // transform: 'translateX(50px)',
          'margin-right': '-351px',
          display: 'none',
        }))]),
      transition('Closed => Opened', [
        style({
          display: 'block'
        }),
        animate('.5s 0s ease',  style({
          display: 'block',
          width: '351px',
          opacity: 1,
          'margin-right': '0px',

          // transform: 'translateX(0px)',
        }))]),
    ],
  ),

  PassesSlideTopBottom: trigger('PassesSlideTopBottom', [
    transition(':enter', [
      style({'margin-top': '0'}),
      animate('.2s linear', style({'margin-top': '0'}))
    ]),
    transition(':leave', [
      style({'margin-top': '0'}),
      animate('.2s linear', style({'margin-top': '0'}))
    ])
  ]),

  HeaderSlideTopBottom: trigger('HeaderSlideTopBottom', [
    transition(':enter', [
      style({'top': '100px'}),
      style({'top': '100%'}),
      animate('.2s linear', style({'top': '100px'}))
    ]),
    transition(':leave', [
      style({'top': '100px'}),
      animate('.2s linear', style({'top': '100%'}))
    ])
  ]),

  RequestCardSlideInOut: trigger('RequestCardSlideInOut', [
    transition(':enter', [
      style({'margin-top': '-100%'}),
      animate( '.2s linear', style({'margin-top': '0'}))
    ]),
    transition(':leave', [
      animate( '.2s linear', style({'margin-top': '-100%'}))
    ]),
  ]),

  HeaderSlideInOut: trigger('HeaderSlideInOut', [
    transition(':enter', [
      style({'top': '-100%'}),
      animate( '.2s linear', style({'top': '100px', 'z-index': 0} ))
    ]),
    transition(':leave', [
      animate( '.2s linear', style({'top': '-100%', 'z-index': 0}))
    ]),
  ]),

  PassesSlideLeftRight: trigger('PassesSlideLeftRight', [
    state('slideIn', style({ transform: 'translateX(-50%)' })),
    state('slideOut', style({ transform: 'translateX(0)' })),
    transition('* => *', animate('.1s'))
  ]),

  PreventInitialChildAnimation: trigger('PreventInitialChildAnimation', [
    transition(':enter', [
      query(':enter', [], {optional: true})
    ])
  ]),
};
