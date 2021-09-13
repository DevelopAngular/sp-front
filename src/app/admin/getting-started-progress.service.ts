import {Injectable} from '@angular/core';
import {AdminService} from '../services/admin.service';

export interface ProgressInterface {
  'create_school:start': 5;
  'create_school:end': 5;
  'take_a_tour:start': 10;
  'take_a_tour:create_accounts': 10;
  'take_a_tour:end': 10;
  'setup_rooms:start': 10;
  'setup_rooms:end': 10;
  'setup_accounts:start': 15;
  'setup_accounts:end': 15;
  'launch_day_prep:start': 5;
  'launch_day_prep:end': 5;
}


@Injectable()
export class GettingStartedProgressService {

  constructor(
    private adminService: AdminService
  ) {}

  updateProgress(ticket) {
    return this.adminService.updateOnboardProgressRequest(ticket);
  }

}
