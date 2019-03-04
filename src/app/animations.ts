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

export const NextStep = trigger('NextStep', [                                                        // :ENTER PSEUDOSTATE
  transition(':enter', group([
      query(`.form-factor, .locations-scaled, .scaled-card`, animate('0.4s 0s ease', keyframes([
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
      ])), {optional: true}),
      query(`
      .from-wrapper-to-date,
      .to-wrapper-to-datee,
      .from-header,
      .to-header,
      .category-header_animation-back
      .category-header,
      .rest-tar-header,
      .rest-mes-header,
      .date-picker,
      .student-groups,
      .locations
      `, animate('0.4s 0s ease', keyframes([
          style({
            background: 'transparent',
            // boxShadow: 'none',
          }),
          // style({
          //   background: 'transparent',
          //   boxShadow: 'none'
          // }),
          style({
            background: 'transparent',
            // boxShadow: 'none',
          }),
        ])), {optional: true}
      ),
      query(`.back-button-white`, animate('0.4s 0s ease', keyframes([
          style({
            opacity: 0,
          }),

          style({
            opacity: 0,
          }),
        ])), {optional: true}
      ),
      query(`
      .divider,
      .category-header_animation-back,
      .date-picker,
      .student-groups,
      .target-footer,
      .from-footer
      `, animate('0.4s 0s ease', keyframes([
          style({
            opacity: 0,
          }),
          // style({
          //   opacity: 1.55,
          // }),
          style({
            opacity: 1,
          })
        ])), {optional: true}
      ),
      query(`
      .divider-header,
      .from-header-text,
      .to-header-text,
      .category-header-text,
      .rest-tar-header-text,
      .rest-mes-header-text,
      .from-content,
      .to-content,
      .category-content,
      .rest-tar-content,
      .rest-mes-content,
      .date-content,
      .student-select,
      .message-entry,
      .divider-text-message,
      .divider-text-students
      `, animate('0.4s 0s ease', keyframes([
          style({
            opacity: 0,
            transform: 'translateX({{from}}px)',
          }),
          // style({
          //   opacity: 1.5,
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
  transition(':leave', group([                                                              // :LEAVE PSEUDOSTATE
    query(`
      .from-wrapper-to-date,
      .to-wrapper-to-date,
      .date-picker,
      .student-groups,
      .locations
      `, animate('0.4s 0s ease', keyframes([
        style({
          background: 'transparent',
          boxShadow: 'none',
        }),
        // style({
        //   background: 'transparent',
        //   boxShadow: 'none'
        // }),
        style({
          background: 'transparent',
          boxShadow: 'none',
        }),
      ])), {optional: true}
    ),
    query(`.form-factor, .locations-scaled, .scaled-card`, animate('0.4s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scale(1)'
      }),
      // style({
      //   opacity: 0.2,
      //   transform: 'scale(1.1)'
      //
      // }),
      style({
        opacity: 0,
        transform: 'scale(0.8)'
      })
    ])), {optional: true}),
      query(`
      .from-header,
      .to-header,
      .to-header-back,
      .category-header,
      .rest-tar-header,
      .rest-mes-header
      `,
      animate('0.4s 0s ease', keyframes([
          style({
            'z-index': 9,
            boxShadow: 'none',

          }),
          // style({
          //   'z-index': 9
          // }),
          style({
            'z-index': 9,
            boxShadow: 'none',
          }),
        ])), {optional: true}
      ),
    query(`.back-button-grey`, animate('0.4s 0s ease', keyframes([
        style({
          opacity: 0,
        }),

        style({
          opacity: 0,
        }),
      ])), {optional: true}
    ),
      query(`
      .divider,
      .category-header_animation-back,
      .date-picker,
      .student-groups,
      .locations,
      .target-footer,
      .from-footer
      `,
      animate('0.4s 0s ease', keyframes([
          style({
            opacity: 1,
          }),
          // style({
          //   opacity: 1.55,
          // }),
          style({
            opacity: 0,
          }),
        ])), {optional: true}
      ),
      query(`
      .divider-header,
      .from-header-text,
      .to-header-text,
      .rest-tar-header_animation-back,
      .rest-mes-header_animation-back,
      .category-header-text,
      .rest-tar-header-text,
      .rest-mes-header-text,
      .from-content,
      .to-content,
      .category-content,
      .rest-tar-content,
      .rest-mes-content,
      .date-content,
      .from-content-to-date,
      .student-select,
      .message-entry,
      .divider-text-message,
      .divider-text-students
      `,
      animate('0.4s 0s ease', keyframes([
            style({
              opacity: 1,
              transform: 'translateX(0px)',
            }),
            // style({
            //   opacity: 1.5,
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










export const ScaledCard = trigger('ScaledCard', [

  transition(':enter', animate('.5s 0s ease', keyframes([
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
  transition(':leave', animate('.5s 0s ease', keyframes([
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
