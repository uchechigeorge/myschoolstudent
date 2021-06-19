import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultsPageRoutingModule } from './results-routing.module';

import { ResultsPage } from './results.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { MaterialModule } from 'src/app/helpers/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultsPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule,
    MaterialModule,
  ],
  declarations: [ResultsPage]
})
export class ResultsPageModule {}
