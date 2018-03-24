import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinBoxDirective } from './spin-box.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SpinBoxDirective
  ],
  exports: [
    SpinBoxDirective
  ]
})
export class NgSpinBoxModule { }
