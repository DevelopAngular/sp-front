import { Component, OnInit, ElementRef} from '@angular/core';
import { ConsentMenuComponent } from '../../consent-menu/consent-menu.component';
import { MatDialogRef, MatDialog } from '@angular/material';



@Component({
  selector: 'app-hallmonitor',
  templateUrl: './hallmonitor.component.html',
  styleUrls: ['./hallmonitor.component.scss']
})
export class HallmonitorComponent implements OnInit {

    constructor(
        public dialog: MatDialog
        
    ) { }

  ngOnInit() {
    }

  genOption(display, color, action) {
      return { display: display, color: color, action: action }
  }

  TooltipPlainText(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      
      header = 'This is simple plain text.';

      this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target }
      });
  }

  TooltipConfirmation(evt: MouseEvent)
  {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      let ConsentText = '';
      let ConsentYesText = '';
      let ConsentNoText = '';
      let ConsentButtonColor = 'green';

      
      header = 'This is sample of Consent';
      ConsentText = 'Are you sure you want to do this process ?'
      ConsentYesText = 'Ok';
      ConsentNoText = 'No Thanks';


      const ConfirmationDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target, 'ConsentText': ConsentText, 'ConsentYesText': ConsentYesText, 'ConsentNoText': ConsentNoText, 'ConsentButtonColor': ConsentButtonColor}
      });


      ConfirmationDialog.afterClosed().subscribe(action => {
          if (action == 'doProcess') {
              alert('Process Perfomed Successfully');
          }
      });
  }


  TooltipOptions(evt: MouseEvent) {
      const target = new ElementRef(evt.currentTarget);
      let options = [];
      let header = '';
      


      header = 'This is sample of list options';

      options.push(this.genOption('Option 1', 'Orange', 'Opt1'));
      options.push(this.genOption('Option 2', 'Black', 'Opt2'));
      options.push(this.genOption('Option 3', 'Green', 'Opt3'));
    


      const OptionsDialog = this.dialog.open(ConsentMenuComponent, {
          panelClass: 'consent-dialog-container',
          backdropClass: 'invis-backdrop',
          data: { 'header': header, 'trigger': target, 'options': options}
      });


      OptionsDialog.afterClosed().subscribe(action => {
          if (action == 'Opt1') {
              alert('Option1 Perfomed Successfully');
          }
          else if (action == 'Opt2') {
                  alert('Option2 Perfomed Successfully');
          }
          else if (action == 'Opt3') {
              alert('Option3 Perfomed Successfully');
          }
      });
  }


}
