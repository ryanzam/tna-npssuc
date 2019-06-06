import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tna-event-card',
  templateUrl: './tna-event-card.component.html',
  styleUrls: ['./tna-event-card.component.scss']
})
export class TnaEventCardComponent implements OnInit {
  @Input() event: any;

  constructor() { }

  ngOnInit() {
  }

}
