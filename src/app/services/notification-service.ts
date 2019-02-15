import { Injectable } from '@angular/core'
import { AngularFireMessaging } from '@angular/fire/messaging';
import { HttpService } from './http-service';
import { Notification as Notif} from '../models/Notification';
import { from, ReplaySubject } from 'rxjs';

@Injectable()
export class NotificationService {

    listening: boolean = false;
    registration: any = {};
    notifPerm: string = '';

    serviceWorkerRegister$ = new ReplaySubject<void>(1)

    constructor(private afm: AngularFireMessaging, private http: HttpService){

        navigator.serviceWorker.register('firebase-messaging-sw.js')
        .then((registration) => {
            this.afm.messaging.subscribe((messaging) => {
                console.log('[Service worker Used]')
                messaging.useServiceWorker(registration);
                this.serviceWorkerRegister$.next(null)
            });
        });

        this.afm.messages.subscribe((message) => {
            let notif = Notif.fromJSON(message);
            this.displayNotification(notif)
        });
    }

    requestNotificationPermission() {
        return Notification.requestPermission().then((perm) => {
            this.notifPerm = perm;
            console.log(this.notifPerm)
            return perm
        });
    }

    getNotificationAuth(){
        this.serviceWorkerRegister$.subscribe(()=>{
            this.getFireToken().subscribe((token) => {
                console.log('[Token regist]')
                this.getServerRegistration(token).subscribe((regitration) => {
                    this.registration = regitration;
                    this.listen(true);
                });
            })
        });
    }

    private getFireToken() {
        return this.afm.requestToken;
    }

    private getServerRegistration(token){
        return this.http.post('auth/device/gcm', {registration_id: token, name: 'web'});
    }
    
    listen(listening) {
        this.listening = listening;
        console.log((this.listening?'':'Not'), "Listening");
    }

    private displayNotification(notification: Notif){
        let notifOptions = {
            body: notification.notification.body,
            icon: '',
            onshow: this.showFunc,
            onerror: this.errorFunc,
            requireInteraction: true
        }
        let notif = new Notification(notification.notification.title, notifOptions)
        console.log(notif)
    }

    private showFunc(){
        console.log('Notif shown')
    }

    private errorFunc(){
        console.log('Notif errored')
    }
}