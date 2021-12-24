import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ExclusionGroup} from '../../models/ExclusionGroup';
import {BehaviorSubject} from 'rxjs';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {NextStep} from '../../animations';

@Component({
  selector: 'app-encounter-prevention-tooltip',
  templateUrl: './encounter-prevention-tooltip.component.html',
  styleUrls: ['./encounter-prevention-tooltip.component.scss'],
  animations: [NextStep]
})
export class EncounterPreventionTooltipComponent implements OnInit {

  @Input() groups: ExclusionGroup[];
  @Output() leave: EventEmitter<any> = new EventEmitter<any>();

  page: number = 0;
  frameMotion$: BehaviorSubject<any>;

  constructor(private formService: CreateFormService) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  nextPage() {
    this.page += 1;
  }

  prevPage() {
    this.page -= 1;
  }

}
