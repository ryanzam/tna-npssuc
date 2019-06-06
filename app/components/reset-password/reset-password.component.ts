import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MdDialogRef, MdSnackBar } from '@angular/material';
import { DataService } from '../../services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'tna-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  @Output() data: any;
  @Output() emitChange = new EventEmitter();

  private _dataSubscription: any;
  resetPasswordForm: FormGroup;
  error: any;

  constructor(private snackBar: MdSnackBar,
    private dataService: DataService,
    private dialogRef: MdDialogRef<ResetPasswordComponent>,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: ['']
    });
  }

  ngOnDestroy() {
    this._dataSubscription.unsubscribe();
  }

  resetPassword(val) {
    this._dataSubscription = this.dataService.resetPassword(this.data, val).subscribe(res => {
      this.openSnackBar(res.message);
      this.closeDialog();
    }, err => this.error = err.text());
  }

  closeDialog() {
    this.error = null;
    this.emitChange.emit(true);
    this.dialogRef.close();
  }

  openSnackBar(message) {
    this.snackBar.open(message, null, { duration: 5000 });
  }
}
