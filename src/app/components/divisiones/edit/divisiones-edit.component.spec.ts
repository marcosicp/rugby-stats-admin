import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposEditComponent } from './equipos-edit.component';

describe('EquiposEditComponent', () => {
  let component: EquiposEditComponent;
  let fixture: ComponentFixture<EquiposEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquiposEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquiposEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
