import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'tna-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit, OnDestroy {
  bordMembers = [];
  paidMembers = [];

  _dataSubscription: any;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this._dataSubscription = this.userService.allUsers.subscribe(res => {
      this.bordMembers = res.filter(mem => mem.is_board_member);
      this.paidMembers = res.filter(mem => !mem.is_board_member && !mem.is_admin && mem.is_verified);

      this.bordMembers = getSortedMembers(this.bordMembers);
      this.paidMembers = getSortedMembers(this.paidMembers);
    });
  }

  ngOnDestroy() {
    if (this._dataSubscription) { this._dataSubscription.unsubscribe(); }
  }
}

export function getSortedMembers(members) {
  const memWithSocialProfile = [];
  const memWithOutSocialProfile = [];
  members.forEach(b => {
    if (!b.skype && !b.google && !b.github && !b.ln_url && !b.fb_url) { memWithOutSocialProfile.push(b); 
    } else { memWithSocialProfile.push(b); }
  });
  return JSON.parse(JSON.stringify(memWithSocialProfile.concat(memWithOutSocialProfile)));
}
