import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditDetailsInputComponent } from './edit-details-input.component';

describe('EditDetailsInputComponent', () => {
  let component: EditDetailsInputComponent;
  let fixture: ComponentFixture<EditDetailsInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDetailsInputComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditDetailsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
