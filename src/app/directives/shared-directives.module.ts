import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideHeaderDirective } from './hide-header.directive';
import { CurrencyInputDirective } from './currency-input.directive';
import { ScratchCardInputDirective } from './scratch-card-input.directive';



@NgModule({
  declarations: [
    HideHeaderDirective,
    CurrencyInputDirective,
    ScratchCardInputDirective,
  ],
  exports: [
    HideHeaderDirective,
    CurrencyInputDirective,
    ScratchCardInputDirective,
  ],
  imports: [
    CommonModule
  ]
})
export class SharedDirectivesModule { }
