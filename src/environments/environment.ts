// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// This is the default environment if you don't use the -c flag
// and this file is used during TypeScript type checking.

export const environment = {
  production: false,
  buildType: 'default',
  preferEnvironment: ('Staging' as null|string|any),
  schoolOnboardApiRoot: 'https://smartpass.app/api/staging',
  funData: true,
  localizejs: {
    apiKey: 'k2CZfKQ5Wqkbk',
  },
  firebase: {
    apiKey: 'AIzaSyDKAexSUkOIj63hP9MkLi22CHpykkh_4Bs',
    authDomain: 'notifyhallpass.firebaseapp.com',
    databaseURL: 'https://notifyhallpass.firebaseio.com',
    projectId: 'notifyhallpass',
    storageBucket: 'notifyhallpass.appspot.com',
    messagingSenderId: '625620388494'
  },
  gg4l: {
    clientId: 'PTRDNUBGDX',
    secretKey: 'zSEk2Qi4UdKWdbRj8ZYUkgJ+bslK9J5DDPxvmMbJd+g='
  }
};
