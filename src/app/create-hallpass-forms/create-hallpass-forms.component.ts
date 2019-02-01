import { Component, OnInit } from '@angular/core';
import { CreateFormService } from './create-form.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-hallpass-forms',
  templateUrl: './create-hallpass-forms.component.html',
  styleUrls: ['./create-hallpass-forms.component.scss']
})
export class CreateHallpassFormsComponent implements OnInit {

  isSeen$: Observable<boolean>;

  constructor(private createFormService: CreateFormService) { }

  ngOnInit() {
    this.isSeen$ = this.createFormService.isSeen$;
  }

}
