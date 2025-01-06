import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketQueueComponent } from './ticket-queue.component';

describe('TicketQueueComponent', () => {
  let component: TicketQueueComponent;
  let fixture: ComponentFixture<TicketQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketQueueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TicketQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
