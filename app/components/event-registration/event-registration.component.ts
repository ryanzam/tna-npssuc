import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MdDialogRef, MdSnackBar } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'tna-event-registration',
  templateUrl: './event-registration.component.html',
  styleUrls: ['./event-registration.component.scss']
})
export class EventRegistrationComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Output() emitChange = new EventEmitter();
  registering = false;
  userProfile: any;
  registerForEventForm: FormGroup;
  _dataSubscription: any;
  persons = {
    adult: 10,
    family: 5,
    children: 0,
    veg: 0,
    totalAmount: 0
  };

  constructor(private snackBar: MdSnackBar,
    private dataService: DataService,
    private userService: UserService,
    private dialogRef: MdDialogRef<EventRegistrationComponent>,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.registerForEventForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['', [Validators.required]],
      no_family: ['0'],
      no_adults: ['0'],
      no_children: ['0'],
      no_vegetarian: ['0']
    }, { validator: numberOfAttendeesVerifier });
    this.userProfile = this.userService.user.value;
    this.userProfile['name'] = (this.userProfile.first_name || '') + (this.userProfile.last_name || '');
    this.registerForEventForm.patchValue(this.userProfile);
  }

  ngOnDestroy() {
    if (this._dataSubscription) { this._dataSubscription.unsubscribe(); }
  }

  registerForEvent() {
    this.registering = true;

    this.dataService.registerForEvent(this.data.uid, this.calculateTotal())
    .then(res => {
      if (res && res.error) {
        this.registering = false;
        this.snackBar.open(res.error, null, { duration: 5000 });
        return;
      }
      this.registering = false;
      this.closeDialog();
      this.snackBar.open('Registrations successful.', null, { duration: 5000 });
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  updateNumbers(resetDependents?) {
    if (resetDependents) {
      this.registerForEventForm.patchValue({
        no_children: '',
        no_vegetarian: ''
      });
    }

    const family = parseInt(this.registerForEventForm.value.no_family, 10);
    const adult = parseInt(this.registerForEventForm.value.no_adults, 10);

    this.persons.veg = adult + family * 3;
    this.persons.children = adult + family * 3;

    this.calculateTotal();
  }

  calculateTotal() {
    const data = this.registerForEventForm.value;

    data.no_adults = parseInt(data.no_adults, 10) || 0;
    data.no_family = parseInt(data.no_family, 10) || 0;
    data.no_vegetarian = parseInt(data.no_vegetarian, 10) || 0;
    data.no_children = parseInt(data.no_children, 10) || 0;
    data.phone = parseInt(data.phone, 10) || 0;
    data['total'] = data.no_adults * this.data.adult_price + data.no_family * this.data.family_price + data.no_children * this.data.children_price;
    this.persons.totalAmount = data['total'];
    if (this.userProfile && this.userProfile.is_verified) {
      this.persons.totalAmount = this.persons.totalAmount - this.persons.totalAmount / 10;
    }
    data['owner'] = this.data.uid;
    return data;
  }

  createArray(val) {
    return Array.from(Array(val).keys());
  }
}

export const numberOfAttendeesVerifier = (control: AbstractControl): { [key: string]: boolean } => {
  const family = control.get('no_family');
  const adults = control.get('no_adults');
  if (!family || !adults) {
    return null;
  }
  return (parseInt(family.value, 10) <= 0 && parseInt(adults.value, 10) <= 0) ? { not_selected: true } : null;
};
