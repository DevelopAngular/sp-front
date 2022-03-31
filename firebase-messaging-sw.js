importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');


firebase.initializeApp({
  apiKey: "AIzaSyDKAexSUkOIj63hP9MkLi22CHpykkh_4Bs",
  authDomain: "notifyhallpass.firebaseapp.com",
  databaseURL: "https://notifyhallpass.firebaseio.com",
  projectId: "notifyhallpass",
  storageBucket: "notifyhallpass.appspot.com",
  messagingSenderId: "625620388494",
  appId: "1:625620388494:web:2205663799869a91"
});

const messaging = firebase.messaging();
