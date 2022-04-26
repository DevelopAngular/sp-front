export const environment = {
  production: true,
  buildType: 'local',
  schoolOnboardApiRoot: 'https://smartpass.app/api/staging',
  //schoolOnboardApiRoot: 'https://smartpass.app/api/prod-us-central',
  preferEnvironment: {
    api_root: 'http://localhost:8000/api/staging/',
    client_id: 'Wmr9cRCU97i8Clp2oaN7Pek8I3C7U7uXLGsJTqPN',
    client_secret: 'kbbJmqWnUxbX3NkBlucHIhHd5Wt9XpcDFuUi9fLVN7ggLjGHknZLz8jVqfwfY3Zxe0o5gNGXRqPPCGBMrjZCn8aQFabNid2MxYYmANxXV2KKg09EvgoNuJA5kDiF2i36',
    domain: 'example.com',
    icon_url: '',
    name: 'Local',
    ws_url: 'wss://smartpass.app/api/staging/v1/long_polling',
    // ws_url: 'ws://localhost:8053/api/debug/v1/long_polling',
  },
  funData: false,
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
