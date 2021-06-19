import { Component, OnInit, Input } from '@angular/core';
import { IRadioPopover } from 'src/app/models/list-models';
import { PopoverController } from '@ionic/angular';
import { radioPopOverID } from 'src/app/models/components-id';

@Component({
  selector: 'app-radio-popover',
  templateUrl: './radio-popover.component.html',
  styleUrls: ['./radio-popover.component.scss'],
})
export class RadioPopoverComponent implements OnInit {

  @Input('options') options: IRadioPopover[] = [];
  @Input() value: string = '';

  constructor(
    private popoverCtrl: PopoverController,
  ) { }

  ngOnInit() {}

  dismissPopover(data: string) {
    this.popoverCtrl.dismiss(data, '', radioPopOverID);
  }

  setValue(e) {
    const option = e.target.value;
    this.dismissPopover(option);
  }

}
