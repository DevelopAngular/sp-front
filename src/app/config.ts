import { NgGapiClientConfig } from 'ng-gapi';

export const GOOGLE_CLIENT_ID = '625620388494-6buq49df4o5r1slgah33kgm3a7gbin23.apps.googleusercontent.com';

export const GAPI_REDIRECT_PATH = 'oauth2/result';

export const GAPI_CONFIG: NgGapiClientConfig | { [key: string]: string } = {
  client_id: GOOGLE_CLIENT_ID,
  scope: [
    'openid',
    'profile',
    'email',
    // 'https://www.googleapis.com/auth/plus.me',
    // 'https://www.googleapis.com/auth/contacts.readonly',
    // 'https://www.googleapis.com/auth/admin.directory.user.readonly',
    // 'https://www.googleapis.com/auth/admin.directory.domain.readonly',
    // 'https://www.googleapis.com/auth/admin.directory.group.readonly',
  ].join(' '),
  prompt: 'consent',
  discoveryDocs: [
    'https://accounts.google.com/.well-known/openid-configuration'
  ],
  ux_mode: 'redirect'
};
