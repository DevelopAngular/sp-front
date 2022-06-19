import { Component, Input, OnChanges, OnInit } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.scss']
})
export class IdCardComponent implements OnInit, OnChanges {

  @Input() backgroundColor: string = '#00B476';
  @Input() profile_picture: string;
  @Input() backsideText: string;
  @Input() logoURL: string;
  @Input() IDNumberData: any = {};

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    // create header using child_id
    console.log(this.backsideText);
  }

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
