import { Component, OnInit, Input } from '@angular/core';
import { HallPass, Request, Invitation } from '../NewModels';

@Component({
  selector: 'app-pass-tile',
  templateUrl: './pass-tile.component.html',
  styleUrls: ['./pass-tile.component.css']
})
export class PassTileComponent implements OnInit {

  @Input() pass: HallPass | Request | Invitation;

  type:string;

  constructor() { }

  ngOnInit() {
    this.type = (this.pass instanceof HallPass) ? 'hallpass' :
    (this.pass instanceof Invitation) ? 'invitation' :
      'request';
    console.log('[Pass Tile Pass]: ', this.pass);
    console.log('[Pass Tile Type]: ', this.type);
  }

  backgroundGradient(){
    let gradient: string[] = this.pass.gradient_color.split(',');

    return 'radial-gradient(circle at 73% 71%, ' + gradient[0] + ', ' + gradient[1] + ')';
  }

  formattedDate(){
    return "Tuesday, 12:41 PM";
  }

}
