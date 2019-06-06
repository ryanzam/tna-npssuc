import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { UserService } from '../../services/user.service';
import { DialogService } from '../../services/dialog.service';
import { TnaImageCropperComponent } from '../tna-image-cropper/tna-image-cropper.component';

@Component({
  selector: 'tna-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']

})
export class ProfilePageComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;

  userProfile: any;
  editMode = false;

  private _userSubscription: any;

  constructor(private snackBar: MdSnackBar,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService,
    private userService: UserService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.profileForm = this.fb.group({
      google: [''],
      last_name: [''],
      post_type: [''],
      post: [''],
      skype: [''],
      first_name: [''],
      date_of_birth: [],
      ln_url: [''],
      fb_url: [''],
      url: [''],
      id: [''],
      tw_url: [''],
      phone: [''],
      address: [''],
      github: [''],
      email: ['', [Validators.required, Validators.email]]
    });

    this._userSubscription = this.userService.user.subscribe(res => {
      this.editMode = false;
      this.userProfile = res;
      this.userProfile.date_of_birth = new Date(this.userProfile.date_of_birth);
      this.toggleFormControlMode();
      this.profileForm.patchValue(this.userProfile);
    });
  }

  ngOnDestroy() {
    if (this._userSubscription) { this._userSubscription.unsubscribe(); }
  }

  toggleFormControlMode() {
    Object.keys(this.userProfile).forEach(key => {
      if (this.profileForm.controls[key]) {
        if (!this.editMode) {
          this.profileForm.controls[key].disable();
        } else {
          this.profileForm.controls[key].enable();
                    this.profileForm.controls.email.disable();
        }
      }
    });
  }

  enableEditMode() {
    this.editMode = true;
    this.toggleFormControlMode();
  }

  updateUser(user) {
    if (user.date_of_birth) {
      user.date_of_birth = user.date_of_birth.toDateString();
    }
    const userData = Object.assign(this.userProfile, user);
    this.userService.writeUserToDb(this.userProfile.uid, userData)
      .then(res => this.snackBarMessage('Profile updated.'))
      .catch(err => this.snackBarMessage(err.message || err));
  }

  resetForm() {
    this.editMode = false;
    this.toggleFormControlMode();
    this.userProfile.date_of_birth = new Date(this.userProfile.date_of_birth);
    this.profileForm.patchValue(this.userProfile);
  }

  snackBarMessage(message) {
    this.snackBar.open(message, null, { duration: 5000 });
  }

  uploadProfilePic() {
    this.dialogService.open(this.viewContainerRef, TnaImageCropperComponent);
  }
}
