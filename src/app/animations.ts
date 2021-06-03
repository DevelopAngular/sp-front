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
    query(`[data-motion-compress*='students']`, animate(`{{frameSpeed}} 0s ease`, keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.24) scaleX(0.6)',
      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
    ])), {optional: true}),
    query(`[data-motion-compress*='locations'],[data-motion-compress*='calendar']`, animate(`{{frameSpeed}} 0s ease`, keyframes([
      style({
        opacity: 0,
        transform: 'scaleY(0.8) scaleX(1.65)',
      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
    ])), {optional: true}),
    query(`[data-motion-scale=true]`, animate(`{{frameSpeed}} 0s ease`, keyframes([
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
        animate(`{{subFrameSpeed}} ease-in`,
          style({
            opacity: 0.25,
            // boxShadow: 'none',
          }),
        ),
        animate(`{{subFrameSpeed}} ease-out`,
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
          animate(`{{subFrameSpeed}} ease-in`, style({
              opacity: 0.25,
              transform: 'translateX({{halfFrom}}px)',
            })
          ),
          animate(`{{subFrameSpeed}} ease-out`, style({
              opacity: 1,
              transform: 'translateX(0px)',
            })
          ),
        ], {optional: true}
      )
    ]), { params: { from: 100, halfFrom: 50, speed: 1}}
  ),
  transition(':leave', group([                                                              // :LEAVE PSEUDOSTATE
    query(`[data-motion-compress*='students']`, animate(`{{frameSpeed}} 0s ease`, keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',

      }),
      style({
        opacity: 1,
        transform: 'scaleY(1.24) scaleX(0.6)',
      })
    ])), {optional: true}),
    query(`[data-motion-compress*='locations'],[data-motion-compress*='calendar']`, animate(`{{frameSpeed}} 0s ease`, keyframes([
      style({
        opacity: 1,
        transform: 'scaleY(1.0) scaleX(1.0)',
      }),
      style({
        opacity: 0,
        transform: 'scaleY(0.8) scaleX(1.65)',
      }),
    ])), {optional: true}),
    query(`[data-motion-scale=true]`, animate(`{{frameSpeed}} 0s ease`, keyframes([
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
          animate(`{{subFrameSpeed}} ease-in`,
            style({
              opacity: 0.25,
              // boxShadow: 'none',
            }),
          ),
          animate(`{{subFrameSpeed}} ease-out`,
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
          animate(`{{subFrameSpeed}} ease-in`, style({
              opacity: 0.25,
              transform: 'translateX({{halfTo}}px)',
            })
          ),
          animate(`{{subFrameSpeed}} ease-out`, style({
              opacity: 0,
              transform: 'translateX({{to}}px)',
            })
          )
        ], {optional: true}
        )
    ]), { params: { to: -100, halfTo: -50}}
  )
]);

export const ResizeProfileImage = trigger('openCloseProfile', [
  state('open', style({
    width: '{{size}}px',
    height: '{{size}}px',
  }), {params: {size: '75'}}),
  state('close', style({
    width: '{{size}}px',
    height: '{{size}}px',
  }), {params: {size: '42'}}),
  transition('open <=> close', [
    animate('0.2s')
  ])
]);

export const showHideProfileEmail = trigger('showHideEmail', [
  state('open', style({
    opacity: 1,
    display: 'block'
  })),
  state('close', style({
    opacity: 0,
    display: 'none'
  })),
  transition('* => open', animate('0.2s ease-in')),
  transition('* => close', animate('0.2s ease-out'))
]);

export const topBottomProfileName = trigger('topBottomName', [
  state('open', style({
    top: 0,
  })),
  state('close', style({
    top: '13px'
  })),
  transition('* <=> *', [
    animate('0.2s')
  ])
]);

export const scaleStudentPasses = trigger('scaleStudentPasses', [
  state('open', style({
    'margin-bottom': '77px',
    height: '405px',
    transform: 'scale(0.97)'
  })),
  state('close', style({
    height: '475px'
  })),
  transition('* => open', animate('0.1s ease-in')),
  transition('* => close', animate('0.1s ease-out'))
]);

export const scalePassCards = trigger('scalePassCards', [
  state('open', style({
    'margin-top': '30px',
    transform: 'scale(0.93)'
  })),
  state('close', style({
    transform: 'scale(0.95)'
  })),
  state('resize', style({
    transform: 'scale(0.95)'
  })),
  state('unresize', style({
    transform: 'scale(1)'
  })),
  transition('* => open', animate('0.1s ease-in')),
  transition('* => close', animate('0.1s ease-out')),
  transition('unresize => resize', animate('0.1s ease-in')),
  transition('resize => unresize', animate('0.1s ease-out'))
]);

export const resizeStudentPasses = trigger('resizeStudentPasses', [
  state('open', style({
    height: '475px',
  })),
  state('close', style({
    height: '75px',
  })),
  transition('* => open', animate('.2s ease-in')),
  transition('open => close', animate('.2s ease-out'))
]);

export const studentPassFadeInOut = trigger('studentPassFadeInOut', [
  transition('* => fadeIn', animate('.2s ease-in', keyframes([
    style({
      opacity: 0,
      transform: 'translateY(5%)'
    }),
    style({
      opacity: 1,
      transform: 'translateY(0%)'
    })
  ]))),
  transition('* => fadeOut', animate('.2s ease-out', keyframes([
    style({
      opacity: 1,
      transform: 'translateY(0%)'
    }),
    style({
      opacity: 0,
      transform: 'translateY(5%)'
    })
  ])))
]);

export const toastSlideInOut = trigger('toastSlideInOut', [
  state('open', style({
    opacity: 1,
    right: '30px'
  })),
  state('close', style({
    opacity: 0,
    right: '-250px'
  })),
  transition('open <=> close', animate('.3s ease')),
]);
