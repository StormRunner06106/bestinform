/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AiCardComponent } from './ai-card.component';

describe('AiCardComponent', () => {
  let component: AiCardComponent;
  let fixture: ComponentFixture<AiCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AiCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
