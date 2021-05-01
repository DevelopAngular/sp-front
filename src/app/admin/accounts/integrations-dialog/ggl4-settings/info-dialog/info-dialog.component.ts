import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../../../../create-hallpass-forms/create-form.service';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  @Input() integrationName: string;

  @Output() nextPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;

  integrations: string[] = [
    './assets/integrations/Power school.png',
    './assets/integrations/Skyward.png',
    './assets/integrations/Aeries.png',
    './assets/integrations/Gradelink.png',
    './assets/integrations/100s more.png'
  ];

  get isClever() {
    return this.integrationName === 'Clever';
  }

  get gradient() {
    return this.isClever ? 'radial-gradient(circle at 73% 71%, #4274F6, #4274F6)' : 'radial-gradient(circle at 73% 71%, #5C4AE3, #336DE4)';
  }

  constructor(
    private formService: CreateFormService
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

}
