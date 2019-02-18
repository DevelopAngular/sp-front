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

export const NextStep = trigger('NextStep', [
  transition(':enter', group([
      query(`
      .from-header,
      .to-header,
      .category-header,
      .rest-tar-header,
      .rest-mes-header
      `, animate('0.65s 0s ease', keyframes([
          style({
            background: 'transparent',
            boxShadow: 'none'
          }),
          // style({
          //   background: 'transparent',
          //   boxShadow: 'none'
          // }),
          style({
            background: 'transparent',
            boxShadow: 'none'
          }),
        ])), {optional: true}
      ),
      // query(`.back-button-grey`, animate('0.65s 0s ease', keyframes([
      //     style({
      //       opacity: 0,
      //     }),
      //
      //     style({
      //       opacity: 0,
      //     }),
      //   ])), {optional: true}
      // ),
      query(`
      .from-header-textt,
      .to-header-textt,
      .category-header_animation-back,
      .category-header-textt,
      .rest-tar-header-textt,
      .rest-mes-header-textt
      `, animate('0.65s 0s ease', keyframes([
          style({
            opacity: 0,
          }),
          // style({
          //   opacity: 0.55,
          // }),
          style({
            opacity: 1,
          })
        ])), {optional: true}
      ),
      query(`
      .from-header-text,
      .to-header-text,
      .category-header_animation-backk,
      .category-header-text,
      .rest-tar-header-text,
      .rest-mes-header-text,
      .from-content,
      .to-content,
      .category-content,
      .rest-tar-content,
      .rest-mes-content
      `, animate('0.65s 0s ease', keyframes([
          style({
            opacity: 0,
            transform: 'translateX({{from}}px)',
          }),
          // style({
          //   opacity: 0.5,
          //   transform: 'translateX({{halfFrom}}px)',
          // }),
          style({
            opacity: 1,
            transform: 'translateX(0px)',
          })
        ])), {optional: true}
      )
    ]), { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', group([
      query(`
      .from-header,
      .to-header,
      .category-header,
      .rest-tar-header,
      .rest-mes-header
      `,
      animate('0.65s 0s ease', keyframes([
          style({
            'z-index': 9
          }),
          // style({
          //   'z-index': 9
          // }),
          style({
            'z-index': 9
          }),
        ])), {optional: true}
      ),
    query(`.back-button-grey`, animate('0.65s 0s ease', keyframes([
        style({
          opacity: 0,
        }),

        style({
          opacity: 0,
        }),
      ])), {optional: true}
    ),
      query(`
      .from-header-textt,
      .to-header-textt,
      .category-header_animation-back,
      .rest-tar-header_animation-backk,
      .rest-mes-header_animation-backk,
      .category-header-textt,
      .rest-tar-header-textt,
      .rest-mes-header-textt
      `,
      animate('0.65s 0s ease', keyframes([
          style({
            opacity: 1,
          }),
          // style({
          //   opacity: 0.55,
          // }),
          style({
            opacity: 0,
          }),
        ])), {optional: true}
      ),
      query(`
      .from-header-text,
      .to-header-text,
      .category-header_animation-backk,
      .rest-tar-header_animation-back,
      .rest-mes-header_animation-back,
      .category-header-text,
      .rest-tar-header-text,
      .rest-mes-header-text,
      .from-content,
      .to-content,
      .category-content,
      .rest-tar-content,
      .rest-mes-content
      `,
      animate('0.65s 0s ease', keyframes([
            style({
              opacity: 1,
              transform: 'translateX(0px)',
            }),
            // style({
            //   opacity: 0.5,
            //   transform: 'translateX({{halfTo}}px)',
            // }),
            style({
              opacity: 0,
              transform: 'translateX({{to}}px)',
            }),

        ])), {optional: true}
      )
    ]), { params: { to: -100, halfTo: -50}}
  )
]);

export const NextStepColored = trigger('NextStepColored', [
  transition(':enter', animate('0.65s 0s ease', keyframes([
      style({
        opacity: 0,
        // transform: 'translateX({{from}}px)',
      }),
      style({
        opacity: 0.2,
        // transform: 'translateX({{halfFrom}}px)',
      }),
      style({
        opacity: 0.3,
        // transform: 'translateX({{halfFrom}}px)',
      }),
      style({
        opacity: 1,
        // transform: 'translateX(0px)',
      })
    ])),
    // { params: { from: 100, halfFrom: 50}}
  ),
  transition(':leave', animate('0.65s 0s ease', keyframes([
      style({
        opacity: 1,
        // transform: 'translateX(0px)',
      }),
      style({
        opacity: 0.3,
        // transform: 'translateX({{halfTo}}px)',
      }),
      style({
        opacity: 0.2,
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

  transition(':enter', animate('0.65s 0s ease', keyframes([
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
  transition(':leave', animate('0.65s 0s ease', keyframes([
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
  transition(':enter', animate('0.65s 0s ease', keyframes([
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
  transition(':leave', animate('0.65s 0s ease', keyframes([
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

  transition(':enter', animate('.65s 0s ease', keyframes([
    style({
      opacity: 0,
      transform: 'scale(1.2)'
    }),
    // style({
    //   opacity: 0.2,
    //   transform: 'scale(1.1)'
    //
    // }),
    style({
      opacity: 1,
      transform: 'scale(1)'
    })
  ]))),
  transition(':leave', animate('.65s 0s ease', keyframes([
    style({
      opacity: 1,
      transform: 'scale(1)'
    }),
    // style({
    //   opacity: 0.2,
    //   transform: 'scale(0.9)'
    //
    // }),
    style({
      opacity: 0,
      transform: 'scale(0.8)'
    })
  ])))
]);
