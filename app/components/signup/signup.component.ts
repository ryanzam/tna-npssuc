import { Component, OnInit} from '@angular/core';
import { MdDialogRef, MdSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'tna-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  registerForm: FormGroup;
  error: any;

  constructor(private snackBar: MdSnackBar,
    private authService: AuthService,
    private userService: UserService,
    private dialogRef: MdDialogRef<SignupComponent>,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: ['']
    });
  }

  signUp(val) {
    this.authService.signUpWithEmailPassword(val.email, val.password)
        .then(res => {
          return this.userService.writeUserToDb(res.uid, {
            email: res.email,
            post_type: 'ME',
            is_active: true
          })
          .then(r => r);
        })
        .then(res => {
          this.openSnackBar('User successfully registered.');
          this.closeDialog();
        })
        .catch(err => this.error = err );
  }

  closeDialog() {
    this.error = null;
    this.dialogRef.close();
  }

  openSnackBar(message) {
    this.snackBar.open(message, null, { duration: 5000 });
  }
}
