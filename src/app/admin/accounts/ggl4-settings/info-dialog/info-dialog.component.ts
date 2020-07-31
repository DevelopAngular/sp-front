import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  @Output() nextPage: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;

  integrations: string[] = [
    './assets/integrations/Power school.png',
    './assets/integrations/Skyward.png',
    './assets/integrations/Aeries.png',
    './assets/integrations/Gradelink.png',
    './assets/integrations/100s more.png'
  ];

  constructor(private formService: CreateFormService) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
