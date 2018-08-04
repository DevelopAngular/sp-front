import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { HttpService } from '../http-service';
import { Util } from '../../Util';
import { Request } from '../models/Request'
import { ConsentMenuComponent } from '../consent-menu/consent-menu.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-inline-request-card',
  templateUrl: './inline-request-card.component.html',
  styleUrls: ['./inline-request-card.component.scss']
})
export class InlineRequestCardComponent implements OnInit {
  @Input() request: Request;
  @Input() forFuture: boolean = false;
  @Input() fromPast: boolean = false;
  @Input() forInput: boolean = false;
  
  selectedDuration: number;
  selectedTravelType: string;
  cancelOpen: boolean = false;

  constructor(private http: HttpService, public dialog: MatDialog) { }

  ngOnInit() {

  }

  formatDateTime(){
    return Util.formatDateTime(this.request.request_time);
  }

  cancelRequest(evt: MouseEvent){
    if(!this.cancelOpen){
      const target = new ElementRef(evt.currentTarget);
      const cancelDialog = this.dialog.open(ConsentMenuComponent, {
        panelClass: 'consent-dialog-container',
        backdropClass: 'invis-backdrop',
        data: {'header': 'Are you sure you want to cancel this request?', 'confirm': 'Cancel', 'deny': 'Close', 'trigger': target}
      });
  
      cancelDialog.afterOpen().subscribe( () =>{
        this.cancelOpen = true;
      });
  
      cancelDialog.afterClosed().subscribe(data =>{
        this.cancelOpen = false;
        let shouldDeny = data==null?false:data;
        if(shouldDeny){
          let endpoint: string = 'api/methacton/v1/pass_requests/' +this.request.id +'/cancel';
          this.http.post(endpoint).subscribe((data)=>{
            console.log('[Request Canceled]: ', data);
          });
        }
      });
    }
  }
}
