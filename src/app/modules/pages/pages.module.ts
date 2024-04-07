import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { GenerateComponent } from './generate/generate.component';
import { DisplayComponent } from './display/display.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [GenerateComponent, DisplayComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    QRCodeModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class PagesModule {}
