import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';


@Component({
  selector: 'tna-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  showNodeaTransaction = false;
  selectedTab = 0;
  private _dataSubscription: any;

  userProfile: any;

  constructor(private dataService: DataService,
              private userService: UserService) { }

  ngOnInit() {
    this._dataSubscription = this.dataService.accounts.subscribe(res => {
      this.userProfile = this.userService.user.value;
    });
  }

  ngOnDestroy() { if (this._dataSubscription) { this._dataSubscription.unsubscribe(); } }

  uploadAccountFile(evt) {
    console.log(evt);
  }
}
