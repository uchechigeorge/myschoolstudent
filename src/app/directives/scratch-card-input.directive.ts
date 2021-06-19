import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import { isPlatform } from "@ionic/angular";
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[appScratchCardInput]'
})
export class ScratchCardInputDirective {

  @Input('appScratchCardInput') isScratchCard: any;

  public lastValue: string = '';
  public isBackSpacing: boolean = false;

  constructor(
    private elem: ElementRef<HTMLInputElement>,
    private domCtrl: DomController,
  ) { }

  @HostListener('input', ['$event']) async onInputChange($event) {

    if(isPlatform('capacitor')) return;

    let input = this.elem.nativeElement;
    let initValue = input.value as any;
    initValue = initValue.replace(/-/g, '');

    this.domCtrl.write(() => {
      input.value = this.formatCardNo(initValue);
      this.lastValue = initValue;
    });
  }

  @HostListener('blur', ['$event']) async onInputBlur($event) {

    if(!isPlatform('capacitor')) return;

    let input = this.elem.nativeElement;
    let initValue = input.value as any;
    initValue = initValue.replace(/-/g, '');

    this.domCtrl.write(() => {
      input.value = this.formatCardNo(initValue);
      this.lastValue = initValue;
    });
  }

  formatCardNo(cardNo: string) {
    let cardArr = cardNo.split('');

    let newCardArr = [];
    cardArr.forEach((val, i) => {
      if(i % 4 == 0 && i != 0) {
        newCardArr.push("-");
      }
      newCardArr.push(val);
    });

    let newCardNo = newCardArr.join('');
    return newCardNo;
  }
}
