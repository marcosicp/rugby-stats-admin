import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionesListComponent } from './divisiones-list.component';

describe('DivisionesListComponent', () => {
  let component: DivisionesListComponent;
  let fixture: ComponentFixture<DivisionesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
