import {Component, Input, OnInit} from '@angular/core';
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

  page: number = 0;
  frameMotion$: BehaviorSubject<any>;

  constructor(private formService: CreateFormService) { }

  ngOnInit(): void {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  nextPage() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page += 1;
    }, 100);
  }

  prevPage() {
    this.page -= 1;
  }

}
