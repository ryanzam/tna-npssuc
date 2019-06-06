import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FirebaseService } from './firebase.service';
import { getArrayFromObject } from '../models/utility';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {
  db: firebase.database.Database = this.fbService.database;
  events: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  accounts: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  attendees: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor(private fbService: FirebaseService,
              private http: HttpClient,) { 
      this.getAccounts();
      this.getEvents();
      this.getEventAttendees();
  }

  getEvents() {
    this.db.ref('/events').on('value', result => {
      this.events.next(getArrayFromObject(result.val()));
    });
  }

  getEventAttendees() {
    this.db.ref('/eventAttendees').on('value', result => {
      this.attendees.next(getArrayFromObject(result.val()));
    });
  }

  getAccounts() {
    this.fbService.auth.onAuthStateChanged(res => {
      let db = null;
      if (!this.fbService.auth.currentUser && db) {
        db.off();
      } else {
        db = this.db.ref('/accounts').on('value', result => {
          const allAccounts = getArrayFromObject(result.val());
          if (!this.fbService.auth.currentUser) {
            this.accounts.next([]);
          } else { this.accounts.next(allAccounts); }
        });
      }
    });
  }

  addEvent(event) {
    return this.db.ref('events/' + this.cleanId(event.title.slice(0, 15)) + event.datetime).set(event);
  }

  deleteEvent(eventId) {
    return this.db.ref('events/' + eventId).remove();
  }

  updateEvent(evt_id, event) {
    return this.db.ref('events/' + evt_id).update(event);
  }

  confirmMembershipPayment(mem_id) {
    return this.db.ref('users/' + mem_id).update({is_verified: true});
  }

  confirmEventPayment(evt_id) {
    return this.db.ref('eventAttendees/' + evt_id).update({has_paid: true});
  }

  registerForEvent(evt_id, data) {
    const userRegistered = this.attendees.value.find(att => att.owner === evt_id && att.email === data.email);
    if (userRegistered) { return Promise.resolve({ error : 'User already registered for this event'}); 
    } else {
      return this.db.ref('eventAttendees/' + evt_id + (this.cleanId(data.name || '')) + new Date().valueOf()).set(data);
    }
  }

  // Get rid of invalid character from keys which firebase doesnt support.
  cleanId(id) {
    return id.replace(/\./g, '').replace(/\$/g, '').replace(/\[/g, '').replace(/\]/g, '').replace(/#/g, '');
  }

  sendMessage(data) {
    const url = 'https://us-central1-turkunepal-21097.cloudfunctions.net/contact';
    return this.http.put(url, data).toPromise();
  }
}
