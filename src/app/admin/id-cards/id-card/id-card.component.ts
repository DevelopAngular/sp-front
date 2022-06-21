import { Component, Input } from '@angular/core';
import { DarkThemeSwitch } from '../../../dark-theme-switch';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.scss']
})
export class IdCardComponent {

  @Input() backgroundColor: string = '#00B476';
  @Input() profile_picture: string;
  @Input() backsideText: string;
  @Input() logoURL: string;
  @Input() IDNumberData: any = {};

  constructor(
    public darkTheme: DarkThemeSwitch,
  ) { }

  get getButtonText(): string{
    return document.getElementById("flip-box-inner").style.transform == "rotateY(180deg)" ? 'Flip to front' : 'Flip to back' 
  }

  toggleFlip(){
    if (document.getElementById("flip-box-inner").style.transform == "rotateY(180deg)") {
      document.getElementById("flip-box-inner").style.transform = "rotateY(0deg)";
    }else {
      document.getElementById("flip-box-inner").style.transform = "rotateY(180deg)";
    }
  }

}
