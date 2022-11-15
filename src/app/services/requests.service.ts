import { Injectable, TemplateRef } from '@angular/core';
import { HttpService } from './http-service';
import { concatMap, filter, map, take } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import {
  PassLimitDialogComponent
} from '../create-hallpass-forms/main-hallpass--form/locations-group-container/pass-limit-dialog/pass-limit-dialog.component';
import {
  ConfirmationDialogComponent, ConfirmationTemplates,
  RecommendedDialogConfig
} from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import { LocationsService } from './locations.service';
import { PassLimitService } from './pass-limit.service';
import { MatDialog } from '@angular/material/dialog';
import { Request } from '../models/Request';
import { PassLimit } from '../models/PassLimit';
import { StudentPassLimit } from '../models/HallPassLimits';

export interface AcceptRequestBody {
  duration?: string;
  teacher_pin?: string;
  overrode_student_pass_limit?: boolean;
  overrode_room_active_limit?: boolean;
}

const OverrideMessage = 'override cancelled';
const OverrideCancelled = new Error(OverrideMessage);

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(
    private http: HttpService,
    private locationsService: LocationsService,
    private passLimitService: PassLimitService,
    private dialog: MatDialog
  ) { }

  // Invitations
  createInvitation(data) {
      return this.http.post('v1/invitations/bulk_create', data);
  }

  acceptInvitation(id, data) {
      return this.http.post(`v1/invitations/${id}/accept`, data);
  }

  denyInvitation(id, data) {
      return this.http.post(`v1/invitations/${id}/deny`, data);
  }

  cancelInvitation(id, data) {
      return this.http.post(`v1/invitations/${id}/cancel`, data);
  }

  // Requests
  createRequest(data) {
      return this.http.post('v1/pass_requests', data);
  }

  acceptRequest(id, data: AcceptRequestBody) {
      return this.http.post(`v1/pass_requests/${id}/accept`, data);
  }

  private openOverrideRoomLimitDialog(passLimit: PassLimit): Observable<boolean> {
    return this.dialog.open(PassLimitDialogComponent, {
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-backdrop',
      width: '450px',
      height: '215px',
      disableClose: true,
      data: {
        passLimit: passLimit.max_passes_to,
        studentCount: 1,
        currentCount: passLimit.to_count,
      }
    }).afterClosed().pipe(map(result => result.override));
  }

  private overrideRoomLimit(body: AcceptRequestBody, request: Request): Observable<AcceptRequestBody> {
    return this.locationsService.pass_limits$.pipe(
      filter(pl => pl.length > 0),
      map((pl) => pl.find(p => p.id.toString() === request.destination.id.toString())),
      take(1),
      concatMap(pl => {
        const roomLimitReached = !!pl
          ? pl?.max_passes_to_active && pl?.max_passes_to <= pl?.to_count
          : false;

        if (!roomLimitReached) {
          return of(body);
        }

        return this.openOverrideRoomLimitDialog(pl).pipe(
          concatMap(overrodeRoomLimit => {
            if (!overrodeRoomLimit) {
              return throwError(OverrideCancelled);
            }
            return of({...body, overrode_room_active_limit: true});
          })
        );
      })
    );
  }

  private openOverrideStudentLimitDialog(studentPassLimit: StudentPassLimit, request: Request, bodyTemplate: TemplateRef<any>): Observable<boolean> {
    return this.dialog.open(ConfirmationDialogComponent, {
      ...RecommendedDialogConfig,
      width: '450px',
      data: {
        headerText: `Student's Pass limit reached: ${request.student.display_name} has had ${studentPassLimit.passLimit}/${studentPassLimit.passLimit} passes today`,
        buttons: {
          confirmText: 'Override limit',
          denyText: 'Cancel'
        },
        body: bodyTemplate,
        templateData: {},
        icon: {
          name: 'Pass Limit (White).svg',
          background: '#6651F1'
        }
      } as ConfirmationTemplates
    }).afterClosed();
  }

  private overrideStudentLimit(body: AcceptRequestBody, request: Request, overriderTemplate: TemplateRef<any>): Observable<AcceptRequestBody> {
    return this.passLimitService.getStudentPassLimit(request.student.id).pipe(
      take(1),
      concatMap(studentLimit => {
        if (studentLimit.noLimitsSet) {
          return of(body);
        }

        return this.passLimitService.getRemainingLimits({studentId: request.student.id}).pipe(
          take(1),
          map(response => response.remainingPasses === 0),
          concatMap(limitReached => {
            if (!limitReached) {
              return of(body);
            }

            return this.openOverrideStudentLimitDialog(studentLimit, request, overriderTemplate).pipe(
              concatMap(overrodeLimit => {
                if (!overrodeLimit) {
                  return throwError(OverrideCancelled);
                }

                return of({ ...body, overrode_student_pass_limit: true });
              })
            );
          })
        );
      })
    );
  }

  checkLimits(body: AcceptRequestBody, request: Request, overriderBody: TemplateRef<any>): Observable<AcceptRequestBody> {
    return this.overrideRoomLimit(body, request).pipe(
      concatMap(updatedBody => this.overrideStudentLimit(updatedBody, request, overriderBody)),
    );
  }

    denyRequest(id, data) {
        return this.http.post(`v1/pass_requests/${id}/deny`, data);
    }

    cancelRequest(id) {
        return this.http.post(`v1/pass_requests/${id}/cancel`);
    }
}
