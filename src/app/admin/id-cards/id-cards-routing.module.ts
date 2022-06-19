import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IdCardEditorComponent } from './id-card-editor/id-card-editor.component';
import { IdCardsComponent } from './id-cards.component';

const routes: Routes = [
  { path: '', component: IdCardsComponent },
  { path: 'editor', component: IdCardEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdCardsRoutingModule { }
