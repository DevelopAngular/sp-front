import {Component} from '@angular/core';

import {StatusBaseComponent} from '../status-base.component';

@Component({
  selector: 'app-status-editor',
  templateUrl: '../status-filter/status-filter.component.html',
  styleUrls: ['../status-filter/status-filter.component.scss'],
})
export class StatusEditorComponent extends StatusBaseComponent {
  type = 'editedStatus';
}
