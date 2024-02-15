import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenamientosEditComponent } from './entrenamientos-edit.component';

describe('EntrenamientosEditComponent', () => {
  let component: EntrenamientosEditComponent;
  let fixture: ComponentFixture<EntrenamientosEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrenamientosEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrenamientosEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
