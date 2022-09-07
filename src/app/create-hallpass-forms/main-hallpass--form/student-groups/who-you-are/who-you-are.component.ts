import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../../create-form.service';
import {MatDialogRef} from '@angular/material/dialog';
import {Navigation} from '../../main-hall-pass-form.component';
import {ScreenService} from '../../../../services/screen.service';
import {LocationVisibilityService} from '../../location-visibility.service';
import {BehaviorSubject} from 'rxjs';
import {User} from '../../../../models/User';
import {GSuiteSelector} from '../../../../sp-search/sp-search.component';

@Component({
  selector: 'app-who-you-are',
  templateUrl: './who-you-are.component.html',
  styleUrls: ['./who-you-are.component.scss']
})
export class WhoYouAreComponent implements OnInit {

  @Input() formState: Navigation;
  @Output() stateChangeEvent: EventEmitter<Navigation> = new EventEmitter();

  frameMotion$: BehaviorSubject<any>;

  constructor(
    private dialogRef: MatDialogRef<WhoYouAreComponent>,
    private formService: CreateFormService,
    private screenService: ScreenService,
    private visibilityService: LocationVisibilityService,
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
  }

  // used for filtering users found with sp-search component
  getFilteringStudents(): (users: User[] | GSuiteSelector[]) => User[] | GSuiteSelector[] {
    return ((uu) => {
      const students = uu.map(u => ''+u.id);
      const loc = this.formState.data.direction.from;
      const ruleStudents = loc.visibility_students.map((v: User) => ''+v.id);
      const rule = loc.visibility_type;
      const skipped = this.visibilityService.calculateSkipped(students, ruleStudents, rule) ?? [];
      const result = !skipped.length ? uu : uu.filter(u => !skipped.includes(''+u.id));
      return result;
    }).bind(this);
  }

  setSelectedStudents(evt) {

    this.formService.setFrameMotionDirection('forward');
    this.formService.compressableBoxController.next(false);

    setTimeout(() => {
    //   debugger

      if (this.formState.forLater) {
        this.formState.step = 1;
        this.formState.fromState = 1;
      } else {
        this.formState.step = 3;
        this.formState.state = 2;
        this.formState.data.kioskModeStudent = evt[0];
        this.formState.fromState = 4;
      }

      this.formState.data.selectedStudents = evt;

      this.stateChangeEvent.emit(this.formState);
    }, 100);
  }
  back() {
    this.dialogRef.close();
  }
}
