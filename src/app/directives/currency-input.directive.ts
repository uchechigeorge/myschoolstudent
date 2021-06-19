import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { DomController, IonInput } from '@ionic/angular';

@Directive({
  selector: '[appCurrencyInput]'
})
export class CurrencyInputDirective {

  @Input('appCurrencyInput') isCurrency: boolean;

  public lastValue: string = '';
  public isBackSpacing: boolean = false;

  constructor(
    private elem: ElementRef<HTMLInputElement>,
    private domCtrl: DomController,
  ) { }

  @HostListener('input', ['$event']) async onInputChange($event) {
    if(!this.isCurrency) return;

    let input = await this.elem.nativeElement;
    let initValue = input.value as any;
    initValue = initValue.replace(/,/g, '');
    if(isNaN(initValue)) return;

    let initValueNo = parseFloat(initValue);

    initValue = initValueNo.toFixed(2).toString();
    let wholeNumber = initValue.replace(/\.[0-9]+/, '');
    let decimalNumber = initValue.replace(wholeNumber, '');
    let wholeNumberArray: string[] = wholeNumber.split('');
    let decimalArray: string[] = decimalNumber.split('');
    let wholeNoModifiedArray: string[] = [];

    this.domCtrl.write(() => {
       
      wholeNumberArray = wholeNumberArray.reverse();
      wholeNumberArray.forEach((value, i) => {
        if(isNaN(parseInt(value))) return;
        wholeNoModifiedArray.push(value);
          if((( i + 1 ) % 3 ) == 0) {
          wholeNoModifiedArray.push(',');
        }
      });

      wholeNoModifiedArray = wholeNoModifiedArray.reverse().concat(decimalArray);

      initValue = wholeNoModifiedArray.join('');
      initValue = initValue.replace(/^,/, '');

      input.value = initValue;
      let dotIndex = initValue.indexOf('.');
      input.selectionStart = dotIndex;
      input.selectionEnd = dotIndex;

      this.lastValue = input.value;
    });
  }
}
