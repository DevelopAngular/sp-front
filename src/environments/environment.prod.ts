
// this corresponds to https://notify-messenger-notify-server-staging.lavanote.com/app/ and https://smartpass.app/app/

export const environment = {
  production: true,
  buildType: 'prod',
  preferEnvironment: null,
  schoolOnboardApiRoot: 'https://smartpass.app/api/prod-us-central',
  funData: false,
  firebase: {
    apiKey: "AIzaSyDKAexSUkOIj63hP9MkLi22CHpykkh_4Bs",
    authDomain: "notifyhallpass.firebaseapp.com",
    databaseURL: "https://notifyhallpass.firebaseio.com",
    projectId: "notifyhallpass",
    storageBucket: "notifyhallpass.appspot.com",
    messagingSenderId: "625620388494"
  },
  gg4l: {
    clientId: 'PTRDNUBGDX',
    secretKey: 'zSEk2Qi4UdKWdbRj8ZYUkgJ+bslK9J5DDPxvmMbJd+g='
  }
};
