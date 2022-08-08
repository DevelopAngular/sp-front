import {Injectable, TemplateRef} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Navigation} from './main-hall-pass-form.component';
import {Location} from '../../models/Location';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {ToastService} from '../../services/toast.service';
import {VisibilityMode} from '../../admin/overlay-container/visibility-room/visibility-room.type';
import {CreateFormService} from '../create-form.service';

@Injectable({
  providedIn: 'root'
})
export class LocationVisibilityService {

  constructor(
    private dialog: MatDialog,
    private toastService: ToastService,
    private formService: CreateFormService,
  ) { }

  // mimic server visibility skipped  calculation
  calculateSkipped(students: string[], ruleStudents: string[], rule: VisibilityMode): string[] | undefined {

     let skipped;

     if (rule ===  "visible_certain_students") {
       if (ruleStudents.length === 0) {
         skipped = students;
       } else {
          const delta: string[] = students.filter(s => (!ruleStudents.includes(s)));
         if (delta.length > 0) {
           skipped = delta;
         }
       }
     } else if (rule === "hidden_certain_students") {
      if (ruleStudents.length > 0) {
        const delta: string[] = students.filter(s => ruleStudents.includes(s));
        if (delta.length > 0) {
          skipped = delta;
        }
      }
    }

    return skipped;
  }

  /*
  // TODO: replaced with copy paste as this method seems to exhaust pinnable observable
  howToActOnChooseLocation(
    formState: Navigation,
    location: Location,
    confirmDialogVisibility: TemplateRef<HTMLElement>,
    forwardAndEmit: () => void,
    destroy$: Subject<any>,
    checkForRoomStudents: boolean = false,
  ): void {
      // staff only
     let selectedStudents = formState.data.selectedStudents;
     if (checkForRoomStudents)
       selectedStudents = formState.data.roomStudents ?? formState.data.selectedStudents;
     const students = selectedStudents.map(s => ''+s.id);
     const ruleStudents = location.visibility_students.map(s => ''+s.id);
     const rule = location.visibility_type;

    // skipped are students that do not qualify to go forward
     let skipped = this.calculateSkipped(students, ruleStudents, rule);

      if (!skipped || skipped.length === 0) {
        forwardAndEmit();
        return;
      }

      let text =  'This room is only available to certain students';
      let title =  'Student does not have permission to come from this room';
      let denyText =  'Cancel';
      if (selectedStudents.length > 1) {
        text = selectedStudents.filter(s => skipped.includes(''+s.id)).map(s => s.display_name)?.join(', ') ?? 'This room is only available to certain students'
        title = 'These students do not have permission to come from this room';
        denyText = 'Skip these students';
      }

      this.dialog.open(ConfirmationDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        closeOnNavigation: true,
        data: {
          body: confirmDialogVisibility,
          buttons: {
            confirmText: 'Override',
            denyText,
          },
          templateData: {alerts: [{title, text}]},
          icon: './assets/Eye (Green-White).svg'
        } as ConfirmationTemplates
      }).afterClosed().pipe(
        takeUntil(destroy$),
      ).subscribe(override => {
        formState.data.roomOverride = !!override;

        if (override === undefined) {
          return;
        }

        // override case
        if (override) {
          forwardAndEmit();
          return;
        }

        // SKIPPING case
        // avoid a certain no students case
        if (selectedStudents.length === 1) return;

        // filter out the skipped students
        const roomStudents = selectedStudents.filter(s => (!skipped.includes(''+s.id)));
        // avoid no students case
        if (roomStudents.length === 0) {
          this.toastService.openToast({
            title: 'Skiping will left no students to operate on',
            subtitle: 'Last operation did not proceeed',
            type: 'error',
          });
          return;
        }

        formState.data.roomStudents = roomStudents;
        forwardAndEmit();
      });
  }
  */

}
