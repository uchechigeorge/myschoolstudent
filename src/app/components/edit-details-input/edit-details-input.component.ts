import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ChangeDetectorRef, OnDestroy, OnChanges, ViewChildren } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';

import { requiredField, preventArrowKeyChange, negativeValidator, validNumber, validAmount } from 'src/app/helpers/input-validators';
import { IValidatorTypes, ISelectOptions, ISelectMultipleOptions, IInputDirectives } from 'src/app/models/list-models';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-edit-details-input',
  templateUrl: './edit-details-input.component.html',
  styleUrls: ['./edit-details-input.component.scss'],
})
export class EditDetailsInputComponent implements OnInit, OnDestroy {

  // public canEdit: boolean = false;
  public prevValue: any;
  public hidePassword: boolean = true;

  @Input() id: any = '';
  @Input() icon: string = '';
  @Input() suffix: string = '';
  // @Input() model: any;
  @Input() noEdit: boolean = false;
  @Input() type: string = 'text';
  @Input() inputmode: string = 'text';
  @Input() directives: IInputDirectives;
  @Input() label: string = '';
  @Input() OKText: string = 'OK';
  @Input() CancelText: string = 'Cancel';
  @Input() validators: IValidatorTypes[] = [];
  @Input() selectMultiple: boolean = false;
  @Input() multipleSelectOptions: boolean = false;
  @Input() selectOptions: ISelectMultipleOptions[] | ISelectOptions[] = [];
  @Input() enableNullSelction: boolean = true;
  @Input() secondaryIcon: string = '';
  @Input() secondaryText: string = '';
  @Input() showSecondaryBtn: boolean = false;
  @Input() showHint: boolean = true;
  @Input() maxLength: number = 50;

  @Input() updateInput : () => Promise<boolean | void>;
  @Input() setValue : () => Promise<string>;

  @Output() onBlurEvent: EventEmitter<any> = new EventEmitter();
  @Output() onChangeEvent: EventEmitter<any> = new EventEmitter();
  @Output() secondaryBtnEvent = new EventEmitter<any>();

  @ViewChild('input') input;
  @ViewChild('noneOpt') noneOpt: MatOption;
  @ViewChildren('selectOpt') selectOpt: MatOption[];

  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  @Input('formController') public formControl: FormControl;

  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('max-width: 600px');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    
  }

  ngOnInit() {
    if(this.selectMode) {
      this.formControl = this.formBuilder.control({ value: this.model, disabled: true },
        [this.arrayContains(this.validators, 'required') ? Validators.required : Validators.nullValidator]);
    }
    else {
      this.formControl = this.formBuilder.control(this.model, [
        this.arrayContains(this.validators, 'required') ? requiredField : Validators.nullValidator,
        this.arrayContains(this.validators, 'email') ? Validators.email : Validators.nullValidator,
        this.arrayContains(this.validators, 'negative') ? negativeValidator : Validators.nullValidator,
        this.arrayContains(this.validators, 'isNan') ? validNumber : Validators.nullValidator,
        this.arrayContains(this.validators, 'currency') ? validAmount : Validators.nullValidator,
        this.arrayContains(this.validators, 'maxLength') ? Validators.maxLength(this.maxLength) : Validators.nullValidator,
      ]);
    }

    this.formControl.valueChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    })

  }

  private _model: any;
  private _canEdit: boolean = false;

  @Input() get model() {
    return this._model;
  }

  set model(value) {
    if(this.selectMode == true){
      this.formControl.setValue(value);
    }
    
    this._model = value;
  }

  @Input('value') get formValue() {
    return this.formControl.value;
  }

  set formValue(value) {
    if(!value) return;
    try {
      this.formControl?.setValue('');
      this.formControl.valueChanges.subscribe(() => {
        this.changeDetectorRef.detectChanges();
      });
      
      this.formControl?.setValue(value);
      this.formControl.updateValueAndValidity();
    } 
    catch (error) { }
  }

  get canEdit () {
    return this._canEdit;
  }

  set canEdit(value) {
    if(this.type == 'select') {
      value ? this.formControl.enable() : this.formControl.disable();
    }
    else {
      this._canEdit = value;
    }
  }

  get controlValue() {
    return this.formControl?.value;
  }

  get selectMode() {
    return this.type == 'select';
  }

  exitEditMode() {
    this.formControl.setValue(this.prevValue);
    this.canEdit = false;
    this.hidePassword = true;
  }

  enterEditMode() {
    this.canEdit = true;
  }

  async check() {
    if(this.updateInput == undefined) return;
    let isValid = await this.updateInput();

    if(isValid == false) {
      this.canEdit = true;
      this.formControl.setValue(this.prevValue);
      this.setFocus();
      this.onChange();
    }
    else{
      this.canEdit = false;
      this.hidePassword = true;
    }
  }

  async setFocus() {
    if(this.selectMode) return;
    if(this.type == "textarea") {
      const input = this.input.nativeElement;
      input.focus();
      input.select();
    }
    else {
      const input = this.input.nativeElement as HTMLInputElement;
      input.focus();
      input.select();
    }
  }

  setFocusBtnClick() {
    this.prevValue = this.model;
    this.enterEditMode();
    this.setFocus();
  }

  onChange(e?: any) {
    this.model = this.controlValue;
    this.onChangeEvent.emit({
      event: e,
      model: this.model
    });
  }

  onBlur(e) {
    this.onBlurEvent.emit(e);
  }

  preventKeyDown(e) {
    if(this.type == 'number') {
      preventArrowKeyChange(e);
    }
  }

  noneOptClick() {
    if(!this.noneOpt.selected) return;

    this.selectOpt?.forEach(option => option.deselect());
  }
  
  selectOptClick() {
    this.noneOpt?.deselect();
  }

  arrayContains(array: any[], value: any): boolean {
    if(!array) array = [];
    return array.indexOf(value) != -1;
  }

  async secondaryBtnClick() {
    this.secondaryBtnEvent.emit();
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}