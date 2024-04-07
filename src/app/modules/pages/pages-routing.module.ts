import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenerateComponent } from './generate/generate.component';
import { DisplayComponent } from './display/display.component';

const routes: Routes = [
  {
    path: '',
    component: GenerateComponent,
  },
  {
    path: 'generate',
    component: GenerateComponent,
  },
  {
    path: 'display',
    component: DisplayComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
