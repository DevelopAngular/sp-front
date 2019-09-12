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
// .from-wrapper-to-date, .from-wrapper, .from-header,
// .to-wrapper-to-date, .to-wrapper, .to-header,
export const NextStep = trigger('NextStep', [                                                        // :ENTER PSEUDOSTATE
  transition(':enter', group([
      query(`.form-factor, .locations-scaled, .scaled-card`, animate('0.5s 0s ease', keyframes([
        style({
          opacity: 0,
          transform: 'scale(1.2)'
        }),
        style({
          opacity: 1,
          transform: 'scale(1)'
        })
      ])), {optional: true}),
      query(`
      .from-wrapper-to-date,
      .to-wrapper-to-date, .to-wrapper, .to-header_animation-backk,
      .from-header,
      .to-header,
      .category-wrapper,
      .rest-tar-headerr, .rest-tar-wrapper, .rest-mes-wrapper,
      .rest-mes-headerr, .rest-mes-header_animation-backk,
      .date-picker,
      .date-content,
      .student-groups,
      .locations
      `, animate('0.5s 0s ease', keyframes([
          style({
            background: 'transparent',
          }),
          style({
            background: 'transparent',
          }),
        ])), {optional: true}
      ),
      query(`.back-button-white`, animate('0.5s 0s ease', keyframes([
          style({
            opacity: 0.5,
          }),

          style({
            opacity: 0.5,
          }),
        ])), {optional: true}
      ),
      query(`
      .divider,
      .category-header,
      .rest-tar-header,
      .rest-mes-header,
      .date-picker,
      .student-groups,
      .target-footer,
      .from-footer
      `, animate('0.5s 0s ease', keyframes([
          style({
            opacity: 0,
          }),
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
      .divider-text-students,
      .page-1,
      .page-2,
      .page-3,
      .page-4,
      .slide,
      .new-room-in-folder-header,
      .room-name, .folder-name, .room-number,
      .rooms-in-folder,
      .teacher-search,
      .travel-settings,
      .restriction-settings,
      .existing-rooms,
      .import-rooms-content
      `, animate('0.5s 0s ease', keyframes([
          style({
            opacity: 0,
            transform: 'translateX({{from}}px)',
          }),
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
      .from-wrapper-to-date, .from-wrapper, .from-header,
      .to-wrapper-to-date, .to-wrapper, .to-header_animation-back, .category-wrapper, .rest-tar-wrapper,
      .rest-mes-wrapper, .rest-mes-header_animation-back,
      .date-picker,
      .student-groups,
      .locations
      `, animate('0.5s 0s ease', keyframes([
        style({
          background: 'transparent',
          boxShadow: 'none',
        }),
        style({
          background: 'transparent',
          boxShadow: 'none',
        }),
      ])), {optional: true}
    ),
    query(`.form-factor, .locations-scaled, .scaled-card`, animate('0.5s 0s ease', keyframes([
      style({
        opacity: 1,
        transform: 'scale(1)'
      }),
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
      animate('0.5s 0s ease', keyframes([
          style({
            'z-index': 9,
            boxShadow: 'none',

          }),
          style({
            'z-index': 9,
            boxShadow: 'none',
          }),
        ])), {optional: true}
      ),
    query(`.back-button-grey`, animate('0.5s 0s ease', keyframes([
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
      .rest-tar-header_animation-back,
      .rest-mes-header_animation-back,
      .date-picker,
      .student-groups,
      .locations,
      .target-footer,
      .from-footer
      `,
      animate('0.5s 0s ease', keyframes([
          style({
            opacity: 1,
          }),
          style({
            opacity: 0,
          }),
        ])), {optional: true}
      ),
      query(`
      .room-name-container
      `,
      animate('0.5s 0s ease', keyframes([
            style({
              position: 'relative',
              height: '0px',
              width: '0px'
            }),
            style({
              position: 'relative',
              height: '0px',
              width: '0px'
            }),

        ])), {optional: true}
      ),
    query(`
      .divider-header,
      .from-header-text,
      .to-header-text,
      .rest-tar-header_animation-backk,
      .rest-mes-header_animation-backk,
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
      .divider-text-students,
      .page-1,
      .page-2,
      .page-3,
      .page-4,
      .slide
      `,
      animate('0.5s 0s ease', keyframes([
            style({
              opacity: 1,
              transform: 'translateX(0px)',
            }),
            style({
              opacity: 0,
              transform: 'translateX({{to}}px)',
            }),

        ])), {optional: true}
      )
    ]), { params: { to: -100, halfTo: -50}}
  )
]);
