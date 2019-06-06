import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { DataService } from '../../../services/data.service';
import { DialogService } from '../../../services/dialog.service';
import { EventRegistrationComponent } from '../../event-registration/event-registration.component';
import { EventCreationComponent } from '../../event-creation/event-creation.component';

@Component({
  selector: 'tna-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy {
  dashainImg = 'https://firebasestorage.googleapis.com/v0/b/turkunepal-21097.appspot.com/o/tna%2Fassets%2Fdashain.jpg?alt=media&token=812b8432-9d07-4685-8fd3-27c2e2895fcd';
  user: any;
  events = [];
  selectedEvent: any;
  registrationOpen = false;
  private _dataSubscription: any;
  private _userSubscription: any;

  constructor(private dataService: DataService,
    private userService: UserService,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService) { }

  ngOnInit() {
    this._userSubscription = this.userService.user.subscribe(res => this.user = res);
  
    this._dataSubscription = this.dataService.events.subscribe(res => {
      if (res.length > 0) {
        this.events = res.sort((a, b) => new Date(b.datetime).valueOf() - new Date(a.datetime).valueOf());
        const pastEvents = this.events.filter(evt => evt.datetime > new Date());  
        this.selectedEvent = pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : this.events[0];
        res.forEach(evt => { if (evt.title.toLowerCase().indexOf('dashain') !== -1) { evt['image'] = this.dashainImg; } });
        this.setRegistrationOpen(this.selectedEvent);
      } else {
        this.events = [];
        this.selectedEvent = null;
      }
    });
  }

  setRegistrationOpen(evt) {
    if (evt.expiry_datetime) {
      this.registrationOpen = new Date(evt.expiry_datetime).valueOf() > new Date().valueOf();
    }
  }

  ngOnDestroy() {
    if (this._dataSubscription) {this._dataSubscription.unsubscribe(); }
    if (this._userSubscription) {this._userSubscription.unsubscribe(); }
  }

  registerForEvent() {
    this.dialogService.open(this.viewContainerRef, EventRegistrationComponent, this.selectedEvent);
  }

  createEvent() {
    this.dialogService.open(this.viewContainerRef, EventCreationComponent);
  }

  editEvent() {
    this.dialogService.open(this.viewContainerRef, EventCreationComponent, this.selectedEvent);
  }
}
