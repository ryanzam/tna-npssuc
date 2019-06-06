import { Component, Input, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { TnaEvent } from '../../models/event';
import { UserService } from '../../services/user.service';
import { DataService } from '../../services/data.service';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'tna-event-creation',
  templateUrl: './event-creation.component.html',
  styleUrls: ['./event-creation.component.scss']
})
export class EventCreationComponent implements OnInit {
  @Input() data: any;
  evtDateError = false;  
  endDateError = false;
  editEvent = false;
  constructor(private dialogRef: MdDialogRef<EventCreationComponent>,
              private snackBar: MdSnackBar,
              private userService: UserService,
              private dataService: DataService) { }

  ngOnInit() {
    this.editEvent = !this.data ? false : true;
    if (!this.data) { 
      this.data = new TnaEvent();
      this.evtDateError = true;
      this.endDateError = true;
      this.data.owner = this.userService.user.value.uid;
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onDateChanged(key, value) {
    if (!value || value.length === 0 || new Date(value).toString() === 'Invalid Date') { this[key] = true; 
    } else {
      this[key] = false;
      this.data[key === 'endDateError' ? 'expiry_datetime' : 'datetime'] = new Date(value)
    }
  }

  onUpdateEvent() {
    this.data.adult_price = !this.data.adult_price || this.data.adult_price < 0 ? 0 : this.data.adult_price;
    this.data.children_price = !this.data.children_price || this.data.children_price < 0 ? 0 : this.data.children_price;
    this.data.family_price = !this.data.family_price || this.data.family_price < 0 ? 0 : this.data.family_price;

    this.data.datetime = this.data.datetime.toString();
    this.data.expiry_datetime = this.data.expiry_datetime.toString();
    if (this.editEvent) {
      const uid = this.data.uid;
      delete this.data['uid'];
      this.dataService.updateEvent(uid, this.data)
          .then(res => { this.closeDialog(); this.snackBarMessage('Event has been successfully updated.')})
          .catch(err => { this.closeDialog(); this.snackBarMessage('Event update failed.')});
    } else {
      this.dataService.addEvent(this.data)
          .then(res => { this.closeDialog(); this.snackBarMessage('Event has been successfully added.')})
          .catch(err => { this.closeDialog(); this.snackBarMessage('Event was not created.')});
    }
  }

  deleteEvent() {
    this.dataService.deleteEvent(this.data.uid)
    .then(res => { this.closeDialog(); this.snackBarMessage('Event has been successfully deleted.')})
    .catch(err => { this.closeDialog(); this.snackBarMessage('Event deletion failed.')});
  }

  snackBarMessage(message) {
    this.snackBar.open(message, null, { duration: 5000 });
  }
}
