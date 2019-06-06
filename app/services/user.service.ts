import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getArrayFromObject } from '../models/utility';

@Injectable()
export class UserService {
  db: firebase.database.Database = this.fbService.database;
  storage: firebase.storage.Storage = this.fbService.storage;
  allUsers: BehaviorSubject<any> = new BehaviorSubject<any>([]);;
  user: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private fbService: FirebaseService) {
    this.fbService.auth.onAuthStateChanged(res => {
      let db = null;
      if (!this.fbService.auth.currentUser && db) {
        db.off();
      } else {
        db = this.db.ref('/users').on('value', result => {
          const allUsers = getArrayFromObject(result.val());
          this.allUsers.next(allUsers);
          if (!this.fbService.auth.currentUser) {
            this.user.next(null);
          } else { this.user.next(allUsers.find(user => user.uid === this.fbService.auth.currentUser.uid)); }
        });
      }
    });
  }

  getUserById(uid) {
    return this.allUsers.value.filter(user => user.uid === uid);
  }

  writeUserToDb(uid, userData) {
    return this.db.ref('users/' + uid).set(userData);
  }

  uploadAvatar(file: File | Blob): Promise<any> {
    if (this.user.value.fullPath) {
      return this.storage.ref(this.user.value.fullPath).delete()
        .then(() => this.uploadAndUpdateURL(file))
        .catch(err => this.uploadAndUpdateURL(file));
    } else {
      return this.uploadAndUpdateURL(file);
    }
  }

  uploadAndUpdateURL(file): Promise<any> {
    return new Promise((resolve, reject) => {
      const metadata = { contentType: 'image/jpeg' };
      const uploadTask = this.storage.ref('images/' + this.user.value.uid + '/avatar/')
        .child('' + new Date().valueOf() + file['name']).put(file, metadata);

      uploadTask.on('state_changed',
        (snapshot: any) => console.log('Upload is in progress.'),
        (error: any) => console.log(error),
        () => {
          this.db.ref('users/' + this.user.value.uid).update({
            profilepicture: uploadTask.snapshot.downloadURL,
            fullPath: uploadTask.snapshot.metadata.fullPath
          })
            .then((res) => { resolve(uploadTask.snapshot); })
            .catch(err => reject(err));
        }
      );
    });
  }
}
