import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {DarkThemeSwitch} from '../../../dark-theme-switch';

@Component({
  selector: 'app-privacy-card',
  templateUrl: './privacy-card.component.html',
  styleUrls: ['./privacy-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyCardComponent implements OnInit {

  @Input() title: string;
  @Input() leftIcon: string;
  @Input() infoText: string;
  @Input() buttonColor: string;
  @Input() buttonLink: string;
  @Input() buttonText: string = 'Learn more';
  @Input() rightLogo: boolean;

  constructor(public darkTheme: DarkThemeSwitch) { }

  ngOnInit() {
  }

}
