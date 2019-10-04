import {animate, group, keyframes, query, state, style, transition, trigger} from '@angular/animations';

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

export const Select = trigger('Select', [
    state('selected',
      style({
        'transform': 'scale(1)',
        'background': '{{background}}',
        'boxShadow': '0px 3px 8px 0px rgba(0, 0, 0, .12), 0px 3px 1px 0px rgba(0, 0, 0, .04)'
      }), { params: { background: 'transparent'}}
    ),
    state('unselected',
      style({
        'transform': 'scale(.95)',
        'background': 'transparent'
      })
      , { params: { background: 'transparent'}}
    ),
    transition('selected <=> unselected', [
      animate('.15s ease-in')
    ])
  ]);

export const NextStep = trigger('NextStep', [                                                        // :ENTER PSEUDOSTATE
  transition(':enter', group([
    query(`[data-motion-compress*='students']`, animate('.45s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.24) scaleX(0.6)',
      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
    ])), {optional: true}),
    query(`[data-motion-compress*='locations'],[data-motion-compress*='calendar']`, animate('.45s 0s ease', keyframes([
      style({
        opacity: 0,
        transform: 'scaleY(0.8) scaleX(1.65)',
      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
    ])), {optional: true}),
    query(`[data-motion-scale=true]`, animate('0.45s 0s ease', keyframes([
        style({
          opacity: 0,
          transform: 'scale(1.2)',
        }),
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ])), {optional: true}),
      query(`
      [data-motion-opacity='forward']
      `, [
        animate('0.0s',
            style({
              opacity: 0,
              // boxShadow: 'none',
            })
        ),
        animate('0.20s ease-in',
          style({
            opacity: 0.25,
            // boxShadow: 'none',
          }),
        ),
        animate('0.20s ease-out',
          style({
            opacity: 1,
            // boxShadow: 'none',
          })
        ),
      ], {optional: true}
      ),
      query(`
      [data-motion-translate='forward'], [data-motion-translate='back']
      `,
        [
          animate('0.0s', style({
              opacity: 0,
              transform: 'translateX({{from}}px)',
            })
          ),
          animate('0.20s ease-in', style({
              opacity: 0.25,
              transform: 'translateX({{halfFrom}}px)',
            })
          ),
          animate('0.20s ease-out', style({
              opacity: 1,
              transform: 'translateX(0px)',
            })
          ),
        ], {optional: true}
      )
    ]), { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', group([                                                              // :LEAVE PSEUDOSTATE
    query(`[data-motion-compress*='students']`, animate('.45s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.24) scaleX(0.6)',
      })
    ])), {optional: true}),
    query(`[data-motion-compress*='locations'],[data-motion-compress*='calendar']`, animate('.45s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',
      }),
      style({
        opacity: 0,
        transform: 'scaleY(0.8) scaleX(1.65)',
      }),
    ])), {optional: true}),
    query(`[data-motion-scale=true]`, animate('0.45s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scale(1)',

      }),
      style({
        opacity: 0,
        transform: 'scale(0.8)',
      })
    ])), {optional: true}),
      query(`
      [data-motion-opacity='back']
      `,
        [
          animate('0.0s',
            style({
              opacity: 1,
              // boxShadow: 'none',
            })
          ),
          animate('0.20s ease-in',
            style({
              opacity: 0.25,
              // boxShadow: 'none',
            }),
          ),
          animate('0.20s ease-out',
            style({
              opacity: 0,
              // boxShadow: 'none',
            })
          ),

        ], {optional: true}
      ),
      query(`
        [data-motion-translate='forward'], [data-motion-translate='back']
        `,
        [
          animate('0.0s', style({
              opacity: 1,
              transform: 'translateX(0px)',
            })
          ),
          animate('0.20s ease-in', style({
              opacity: 0.25,
              transform: 'translateX({{halfTo}}px)',
            })
          ),
          animate('0.20s ease-out', style({
              opacity: 0,
              transform: 'translateX({{to}}px)',
            })
          )
        ], {optional: true}
        )
    ]), { params: { to: -100, halfTo: -50}}
  )
]);
