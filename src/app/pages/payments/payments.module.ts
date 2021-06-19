import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentsPageRoutingModule } from './payments-routing.module';

import { PaymentsPage } from './payments.page';
import { MaterialModule } from 'src/app/helpers/material.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { Angular4PaystackModule } from 'angular4-paystack';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentsPageRoutingModule,
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule,
    Angular4PaystackModule.forRoot(""),
  ],
  declarations: [PaymentsPage]
})
export class PaymentsPageModule {}
