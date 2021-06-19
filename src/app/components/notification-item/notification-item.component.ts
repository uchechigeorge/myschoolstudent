import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isDefaultImage } from 'src/app/models/list-models';

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
})
export class NotificationItemComponent implements OnInit {

  @Input() message?: string;
  @Input() title?: string;
  @Input() data?: any;
  @Input() id?: any;
  @Input() button?: boolean;
  @Input() icon?: string;
  @Input() imgSrc?: string;
  @Input() hasImg?: boolean;
  @Input() hasHeader?: boolean;
  @Input() header?: string;
  @Input() unread?: boolean;
  @Input() time?: any;
  @Input() displayTime?: any;
  @Input() headerStatus?: 'today' | 'yesterday' | 'ago' | '';
  @Input() showEditIcon: boolean = false;
  @Input() showDeleteIcon: boolean = false;

  @Output() itemClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() editClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  imgErr() {
    this.hasImg = false;
  } 

  imgLoaded() {
    this.hasImg = true;
    if(isDefaultImage(this.imgSrc)){
      this.imgSrc = "";
      this.hasImg = false;
    }
  }

  onItemClick() {
    this.itemClick.emit();
  }

  onDeleteClick() {
    this.deleteClick.emit();
  }
  onEditClick() {
    this.editClick.emit();
  }
}
