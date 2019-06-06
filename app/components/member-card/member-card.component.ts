import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tna-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit {
  @Input() member: any;

  memberPosition = {
    'CM': 'CHAIRMAN',
    'VC': 'VICE-CHAIRMAN',
    'SE': 'SECRETARY',
    'TR': 'TREASURER',
    'DO': 'DevOps',
    'ME': 'MEMBER'
  };

  constructor() { }

  ngOnInit() {
  }

}
