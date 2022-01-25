import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})
export class StudentSearchComponent implements OnInit {

  @Input() focused: boolean;
  @Input() height: string = '40px';
  @Input() width: string;

  public isFocus: boolean;
  public result: any[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  search(value) {
    this.userService.searchProfile('_profile_student', 50, value).subscribe(res => {
      this.result = res.results;
    });
  }

  goToUserPage(value) {
    this.router.navigateByUrl(`/main/student/${value.id}`);
    this.isFocus = false;
  }

}
