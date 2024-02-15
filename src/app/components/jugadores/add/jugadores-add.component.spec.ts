import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JugadoresAddComponent } from './jugadores-add.component';

describe('JugadoresAddComponent', () => {
  let component: JugadoresAddComponent;
  let fixture: ComponentFixture<JugadoresAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JugadoresAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JugadoresAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
