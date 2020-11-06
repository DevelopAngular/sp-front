import {Component, ElementRef, Inject, OnInit, Optional} from '@angular/core';
import {DarkThemeSwitch} from '../dark-theme-switch';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../services/user.service';
import {map} from 'rxjs/operators';
import {User} from '../models/User';

declare const window;

@Component({
  selector: 'app-support-options',
  templateUrl: './support-options.component.html',
  styleUrls: ['./support-options.component.scss']
})
export class SupportOptionsComponent implements OnInit {

  options: any[];
  targetElementRef: ElementRef;

  constructor(
    public darkTheme: DarkThemeSwitch,
    private dialogRef: MatDialogRef<SupportOptionsComponent>,
    private userService: UserService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.targetElementRef = this.data['trigger'];
    this.userService.user$.pipe(map(user => User.fromJSON(user))).subscribe((user) => {
      this.options = [
        { name: 'Support guides', image: 'Tour', hasShow: true, hovered: false,  link: 'https://www.smartpass.app/support'},
        { name: 'Chat with us', image: 'Chat', hasShow: !user.isStudent(), hovered: false },
        { name: 'Report a bug', image: 'Bug', hasShow: true, hovered: false, link: 'https://www.smartpass.app/bugreport'},
        { name: 'What’s new?', image: 'Balloons', hasShow: true, hovered: false, link: 'https://www.smartpass.app/updates' },
        { name: 'Suggest a feature', image: 'Latter', hasShow: !user.isStudent(), hovered: false, link: 'https://wishlist.smartpass.app' }
      ];
      this.updateDialogPosition(user);
    });
  }

  getIcon(iconName: string, setting: any,  hover?: boolean, hoveredColor?: string) {
    return this.darkTheme.getIcon({
      iconName: iconName,
      setting: setting,
      hover: hover,
      hoveredColor: hoveredColor
    });
  }

  getColor(dark, white) {
    return this.darkTheme.getColor({ dark, white });
  }

  updateDialogPosition(user) {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    if (this.targetElementRef && this.dialogRef) {
      const rect = this.targetElementRef.nativeElement.getBoundingClientRect();
      matDialogConfig.position = { left: `${rect.left + (rect.width / 2) - 210 }px`, top: `${rect.bottom - (user.isStudent() ? 240 : 320)}px` };
      this.dialogRef.updatePosition(matDialogConfig.position);
    }
  }

  openHubspot() {
    this.dialogRef.close(true);
    const chat = document.querySelector('#hubspot-messages-iframe-container');
    (chat as HTMLElement).setAttribute('style', 'opacity: 1 !important');
    // window.hubspot.messages.EXPERIMENTAL_API.requestWidgetOpen();
    window.HubSpotConversations.widget.open();
  }

}
