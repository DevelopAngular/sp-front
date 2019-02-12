import {animate, group, keyframes, query, state, style, transition, trigger} from '@angular/animations';
import {st} from '@angular/core/src/render3';

export const bumpIn = trigger('pressState', [
  state('down', style({
    transform: 'scale(0.97)'
  })),
  state('up', style({
    transform: 'scale(1)'
  })),
  transition('up => down', animate('100ms ease-out')),
  transition('down => up', animate('100ms ease-in'))
]);

export const NextStep = trigger('NextStep', [
  transition(':enter', group([query('.header', animate('0.7s 0s ease', keyframes([
      style({
        opacity: 0.5,
        backgroundColor: 'red',
        // transform: 'translateX({{from}}px)',
      }),
      style({
        opacity: 0.5,
        backgroundColor: 'red',
        // transform: 'translateX({{halfFrom}}px)',
      }),
      style({
        backgroundColor: 'green',
        opacity: 1,
        // transform: 'translateX(0px)',
      })
    ]))),
      query('.content', animate('0.7s 0s ease', keyframes([
        style({
          opacity: 0,
          transform: 'translateX({{from}}px)',
        }),
        style({
          opacity: 0,
          transform: 'translateX({{halfFrom}}px)',
        }),
        style({
          opacity: 1,
          transform: 'translateX(0px)',
        })
      ])))]),
    { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', animate('0.7s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'translateX(0px)',
      }),
      style({
        opacity: 0,
        transform: 'translateX({{halfTo}}px)',
      }),
      style({
        opacity: 0,
        transform: 'translateX({{to}}px)',
      }),
    ])),
    { params: { to: -100, halfTo: -50}}
  )
]);

export const NextStepColored = trigger('NextStepColored', [
  transition(':enter', animate('0.7s 0s ease', keyframes([
      style({
        opacity: 0,
        // transform: 'translateX({{from}}px)',
      }),
      style({
        opacity: 0,
        // transform: 'translateX({{halfFrom}}px)',
      }),
      style({
        opacity: 1,
        // transform: 'translateX(0px)',
      })
    ])),
    // { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', animate('0.7s 0s ease', keyframes([
      style({
        opacity: 1,
        // transform: 'translateX(0px)',
      }),
      style({
        opacity: 0,
        // transform: 'translateX({{halfTo}}px)',
      }),
      style({
        opacity: 0,
        // transform: 'translateX({{to}}px)',
      }),
    ])),
    // { params: { to: -100, halfTo: -50}}
  )
]);



export const HeaderShowingUp = trigger('HeaderShowingUp', [

  transition(':enter', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 0
    }),
    style({
      opacity: 0
    }),
    style({
      opacity: 1
    })
  ]))),
  transition(':leave', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 1
    }),
    style({
      opacity: 0
    }),
    style({
      opacity: 0
    })
  ])))
]);

export const BodyShowingUp = trigger('BodyShowingUp', [
  transition(':enter', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 0,
      transform: 'translateX({{from}}px)',
    }),
    style({
      opacity: 0,
      transform: 'translateX({{halfFrom}}px)',
    }),
    style({
      opacity: 1,
      transform: 'translateX(0px)',
    })
  ])),
    { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 1,
      transform: 'translateX(0px)',
    }),
    style({
      opacity: 0,
      transform: 'translateX({{halfTo}}px)',
    }),
    style({
      opacity: 0,
      transform: 'translateX({{to}}px)',
    })
  ])),
    { params: { to: -100, halfTo: -50}}
  ),
]);

export const ScaledCard = trigger('ScaledCard', [

  transition(':enter', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 0,
      transform: 'scale(1.3)'
    }),
    style({
      opacity: 0,
      transform: 'scale(1.1)'

    }),
    style({
      opacity: 1,
      transform: 'scale(1)'
    })
  ]))),
  transition(':leave', animate('0.7s 0s ease', keyframes([
    style({
      opacity: 1,
      transform: 'scale(1)'
    }),
    style({
      opacity: 0,
      transform: 'scale(0.9)'

    }),
    style({
      opacity: 0,
      transform: 'scale(0.7)'
    })
  ])))
]);
