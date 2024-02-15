import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrenamientosAddComponent } from './entrenamientos-add.component';

describe('EntrenamientosAddComponent', () => {
  let component: EntrenamientosAddComponent;
  let fixture: ComponentFixture<EntrenamientosAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrenamientosAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrenamientosAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
