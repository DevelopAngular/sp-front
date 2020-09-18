import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

declare const window;

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  openSupportTrigger$: Subject<any> = new Subject<any>(); // needs for open support button

  constructor() { }

  openChat(event) {
    event.stopPropagation();
    const chat = document.querySelector('#hubspot-messages-iframe-container');
    (chat as HTMLElement).setAttribute('style', 'opacity: 1 !important');
    // window.hubspot.messages.EXPERIMENTAL_API.requestWidgetOpen();
    window.HubSpotConversations.widget.open();
  }

  closeChat(event) {
    event.stopPropagation();
    const chat = document.querySelector('#hubspot-messages-iframe-container');
    if (chat) {
      window.HubSpotConversations.widget.close();
      (chat as HTMLElement).setAttribute('style', 'opacity: 0 !important');
    }
  }
}
