import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { OverlayDataService } from '../overlay-data.service';

@Component({
  selector: 'app-bulk-edit-rooms-in-folder',
  templateUrl: './bulk-edit-rooms-in-folder.component.html',
  styleUrls: ['./bulk-edit-rooms-in-folder.component.scss']
})
export class BulkEditRoomsInFolderComponent implements OnInit {

  @Input() form: FormGroup;

  @Output() back = new EventEmitter();

  selectedRoomsInFolder: any[];

  constructor(private overlayService: OverlayDataService) { }

  ngOnInit() {
    this.selectedRoomsInFolder = this.overlayService.pageState.getValue().data.selectedRoomsInFolder;
  }

  goBack() {
    this.back.emit();
  }

}
