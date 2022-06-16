import { Component, OnInit } from '@angular/core';

type VisibilityMode = 'visible_all_students' | 'visible_certain_students' | 'hidden_certain_students';

@Component({
  selector: 'app-visibility-room',
  templateUrl: './visibility-room.component.html',
  styleUrls: ['./visibility-room.component.scss']
})
export class VisibilityRoomComponent implements OnInit {

  mode: VisibilityMode = 'visible_all_students'; 
  mapMode: Record<VisibilityMode, string> = {
    'visible_all_students': 'Show room for all students',
    'visible_certain_students': 'Show room for certain students',
    'hidden_certain_students': 'Hide room for certain students',
  };

  constructor() {}

  tooltipText: string = 'Change room visibility';

  ngOnInit(): void {}

}
