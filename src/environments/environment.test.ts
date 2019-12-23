export const environment = {
  production: true,
  buildType: 'local',
  preferEnvironment: {
    api_root: 'https://smartpass.app/api/staging/',
    // client_id: 'xDvFSNqxfNwf52eYz8I7SnMJKw9nghifZttfl1ec',

    // client_secret: 'feENKl4wWJzDkGu9gQNbevDGBi8ntYoiOrI1Fu1mzOZlZPHBaX7VC2Bz9zwuFHh0tdNz64Dr2iUbMztOao16R2swamHv7w6pppH6uwRZDK4OKa5B80fxaoskMnfHneYh',
    client_id: "Wmr9cRCU97i8Clp2oaN7Pek8I3C7U7uXLGsJTqPN",
    client_secret: "kbbJmqWnUxbX3NkBlucHIhHd5Wt9XpcDFuUi9fLVN7ggLjGHknZLz8jVqfwfY3Zxe0o5gNGXRqPPCGBMrjZCn8aQFabNid2MxYYmANxXV2KKg09EvgoNuJA5kDiF2i36",
    domain: 'example.com',
    icon_url: '',
    name: 'Local',
    ws_url: 'wss://smartpass.app/api/staging/v1/long_polling',
    // ws_url: 'ws://localhost:8053/api/debug/v1/long_polling',
  },
  firebase: {
    apiKey: 'AIzaSyDKAexSUkOIj63hP9MkLi22CHpykkh_4Bs',
    authDomain: 'notifyhallpass.firebaseapp.com',
    databaseURL: 'https://notifyhallpass.firebaseio.com',
    projectId: 'notifyhallpass',
    storageBucket: 'notifyhallpass.appspot.com',
    messagingSenderId: '625620388494'
  },
  funData: false,
};
