import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartidosAddComponent } from './partidos-add.component';

describe('PartidosAddComponent', () => {
  let component: PartidosAddComponent;
  let fixture: ComponentFixture<PartidosAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartidosAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartidosAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
