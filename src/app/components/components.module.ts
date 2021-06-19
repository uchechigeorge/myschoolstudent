import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../helpers/material.module';
import { LoginLogoComponent } from './svgs/login-logo/login-logo.component';
import { LoginTitleComponent } from './svgs/login-title/login-title.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { NewsItemComponent } from './news-item/news-item.component';
import { RadioPopoverComponent } from './radio-popover/radio-popover.component';
import { ForgotPasswordComponent } from './modals/forgot-password/forgot-password.component';
import { ModalHeaderComponent } from './modals/modal-header/modal-header.component';
import { RecoveryEmailComponent } from './modals/recovery-email/recovery-email.component';
import { ResetPasswordComponent } from './modals/reset-password/reset-password.component';
import { EditDetailsInputComponent } from './edit-details-input/edit-details-input.component';
import { SharedDirectivesModule } from '../directives/shared-directives.module';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { UpdateScratchCardComponent } from './modals/update-scratch-card/update-scratch-card.component';
import { SchoolTitleComponent } from './svgs/school-title/school-title.component';


@NgModule({
  declarations: [
    LoginLogoComponent,
    LoginTitleComponent,
    SchoolTitleComponent,
    LoginFormComponent,
    NewsItemComponent,
    RadioPopoverComponent,
    ForgotPasswordComponent,
    ModalHeaderComponent,
    RecoveryEmailComponent,
    ResetPasswordComponent,
    EditDetailsInputComponent,
    NotificationItemComponent,
    UpdateScratchCardComponent,
  ],
  exports: [
    LoginLogoComponent,
    LoginTitleComponent,
    SchoolTitleComponent,
    LoginFormComponent,
    NewsItemComponent,
    RadioPopoverComponent,
    ForgotPasswordComponent,
    ModalHeaderComponent,
    RecoveryEmailComponent,
    ResetPasswordComponent,
    EditDetailsInputComponent,
    NotificationItemComponent,
    UpdateScratchCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedDirectivesModule,
  ]
})
export class ComponentsModule { }
