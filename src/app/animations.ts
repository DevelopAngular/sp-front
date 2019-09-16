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
      query(`.form-factor, .locations-scaled, .scaled-card`, animate('1.2s 0s ease', keyframes([
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
      [data-motion-transparent],
      .from-wrapper-to-date,
      .to-wrapper-to-date, .to-wrapper,
      .from-header,
      .to-header,
      .category-wrapper,
      .rest-tar-wrapper, .rest-mes-wrapper,
      .date-picker,
      .date-content,
      .student-groups,
      .locations
      `, animate('1.2s 0s ease', keyframes([
          style({
            background: 'transparent',
          }),
          style({
            background: 'transparent',
          }),
        ])), {optional: true}
      ),
      query(`.back-button-white`, animate('1.2s 0s ease', keyframes([
          style({
            opacity: 0.5,
          }),

          style({
            opacity: 0.5,
          }),
        ])), {optional: true}
      ),
      query(`
      [data-motion-opacity='back'],
      .dividerr,
      .category-headerr,
      .rest-tar-headerr,
      .rest-mes-headerr,
      .date-pickerr,
      .student-groups,
      .target-footer,
      .from-footer
      `, animate('1.2s 0s ease', keyframes([
          style({
            opacity: 0,
            boxShadow: 'none',

          }),
          style({
            opacity: 1,
            boxShadow: 'none',

          })
        ])), {optional: true}
      ),
      query(`
      [data-motion-translate],
      .divider-headerr,
      .from-header-textt,
      .to-header-textt,
      .category-header-textt,
      .rest-tar-header-textt,
      .rest-mes-header-textt,
      .from-contentt,
      .to-contentt,
      .category-contentt,
      .rest-tar-contentt,
      .rest-mes-contentt,
      .date-contentt,
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
      `, animate('1.2s 0s ease', keyframes([
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
      [data-motion-transparent],
      .from-wrapper-to-date, .from-wrapper, .from-headerr,
      .to-wrapper-to-date, .to-wrapper, .to-header_animation-backk,
      .category-wrapper,
      .rest-tar-wrapper, .rest-mes-wrapper, .rest-mes-header_animation-backk,
      .date-picker,
      .student-groups,
      .locations
      `, animate('1.2s 0s ease', keyframes([
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
    query(`.form-factor, .locations-scaled, .scaled-card`, animate('1.2s 0s ease', keyframes([
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
      animate('1.2s 0s ease', keyframes([
          style({
            // 'z-index': 9,
            boxShadow: 'none',

          }),
          style({
            // 'z-index': 9,
            boxShadow: 'none',
          }),
        ])), {optional: true}
      ),
    query(`.back-button-grey`, animate('1.2s 0s ease', keyframes([
        style({
          opacity: 0,
        }),

        style({
          opacity: 0,
        }),
      ])), {optional: true}
    ),
      query(`
      [data-motion-opacity='forward'],
      .dividerr,
      .category-header_animation-backk,
      .rest-tar-header_animation-backk,
      .rest-mes-header_animation-backk,
      .date-pickerr,
      .student-groups,
      .locations,
      .target-footer,
      .from-footer
      `,
      animate('1.2s 0s ease', keyframes([
          style({
            opacity: 1,
            boxShadow: 'none',
          }),
          style({
            opacity: 0,
            boxShadow: 'none',
          }),
        ])), {optional: true}
      ),
      query(`
      .room-name-container
      `,
      animate('1.2s 0s ease', keyframes([
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
      [data-motion-translate],
      .divider-headerr,
      .from-header-textt,
      .to-header-textt,
      .category-header-textt,
      .rest-tar-header-textt,
      .rest-mes-header-textt,
      .from-contentt,
      .to-contentt,
      .category-contentt,
      .rest-tar-contentt,
      .rest-mes-contentt,
      .date-contentt,
      .from-content-to-datee,
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
      animate('1.2s 0s ease', keyframes([
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
