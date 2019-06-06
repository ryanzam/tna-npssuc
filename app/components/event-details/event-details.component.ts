import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tna-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  @Input() selectedEvent: any;
  @Input() user: any;
  today = new Date();
  constructor() { }

  ngOnInit() {}

  getValueOf(date) {
    if (date) { return new Date(date).valueOf(); }
  }
}
