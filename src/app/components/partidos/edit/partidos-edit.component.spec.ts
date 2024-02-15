import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidosEditComponent } from './partidos-edit.component';

describe('PartidosEditComponent', () => {
  let component: PartidosEditComponent;
  let fixture: ComponentFixture<PartidosEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartidosEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidosEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
