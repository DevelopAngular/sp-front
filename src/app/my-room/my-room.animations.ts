import {animate, state, style, transition, trigger} from '@angular/animations';

export const MyRoomAnimations = {
  calendarTrigger: trigger('calendarSlide', [
    state('slideLeft', style({
      display: 'block',
      opacity: 1,
      'margin-right': '0px',

    })),
    state('slideRight', style({
      display: 'none',
      opacity: 0,
      'margin-right': '-320px'
    })),

    transition('slideLeft => slideRight', [
      animate('.1s 0s ease', style({
        opacity: 0,
        'margin-right': '-320px',
        display: 'none',
      }))]),
    transition('slideRight => slideLeft', [
      style({
        display: 'block',
        'margin-right': '-320px'
      }),
      animate('.1s 0s ease', style({
        display: 'block',
        opacity: 1,
        'margin-right': '0px',
      }))]),

    state('slideTop', style({
      display: 'block',
      'margin-top': '0px',
    })),
    state('slideBottom', style({
      display: 'none',
      opacity: '0',
      'margin-top': '-40px',
    })),
    transition('slideTop => slideBottom', [
      animate('.1s', style({
        'margin-top': '-50px',
        display: 'none',
        opacity: '0',
      }))]),
    transition('slideBottom => slideTop', [
      style({
        display: 'block',
        opacity: '0'
      }),
      animate('.1s', style({
        display: 'block',
        'margin-top': '0px',
         opacity: '1'
      }))]),
  ]),

  collectionsBlockTrigger: trigger('collectionsTrigger', [
    state('collectionsTop', style({})),
    state('collectionsBottom', style({})),
    transition('collectionsTop => collectionsBottom', animate('.1s', style({
      'transform': 'translateY(-320px)'
    }))),
    transition('collectionsBottom => collectionsTop', animate('.1s')),
  ]),

  headerTrigger: trigger('headerTrigger', [
    state('headerTop', style({
        'margin-top': '-50px',
        visibility: 'hidden',
        transform: 'scale(.8)'
    })),
    state('headerBottom', style({
      visibility: 'visible',
      transform: 'scale(1)',
    })),
    transition('headerTop => headerBottom', animate('.1s', style({
      'margin-top': '0',
      visibility: 'visible',
      transform: 'scale(1)',
      opacity: 1
    }))),
    transition('headerBottom => headerTop', animate('.1s', style({
      'margin-top': '-50px',
      visibility: 'hidden',
    })))
  ]),

  calendarIconTrigger: trigger('calendarIconTrigger', [
    state('calendarIconLeft', style({
        visibility: 'hidden',
        'margin-left': '-50px',
    })),
    state('calendarIconRight', style({
      visibility: 'visible',
    })),
    transition('calendarIconLeft => calendarIconRight', animate('.1s', style({
      'margin-left': '0',
      visibility: 'visible',
      opacity: 1
    }))),
    transition('calendarIconRight => calendarIconLeft', animate('0s', style({
      visibility: 'hidden',
    })))
  ])
};
