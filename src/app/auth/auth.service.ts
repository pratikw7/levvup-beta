import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { User } from './user.model';
import { AllService } from '../services/all.service';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;
  myuser: any;
  mauth: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  constructor(private router: Router,
              private http: HttpClient, 
              private allService: AllService) {
                const auth = getAuth();
                onAuthStateChanged(auth, (user) => {
                  if (user) {
                    this.myuser = user;
                    console.log('User set');
                    console.log(this.myuser);
                  } else {
                    console.log('User NOT set');
                  }
                });
              }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      })
    );
  }

  signup(email: string, password: string) {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          // Store user data in Firestore
          const db = getFirestore();
          setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: new Date()
          });
          
          // Add user to app's user database
          this.allService.addUserToDB(email);
          
          return user;
        }
        throw new Error('User creation failed');
      });
  }

  login(email: string, password: string) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          this.mauth = auth;
          return user;
        }
        throw new Error('Login failed');
      });
  }

  logout() {
    const auth = getAuth();
    auth.signOut();
    this._user.next(null);
    this.router.navigateByUrl('/auth');
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = null;
  }

  resetPassword(email: string) {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  }

  changePassword(oldpwd: string, newpwd: string) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, oldpwd);
      return reauthenticateWithCredential(user, credential)
        .then(() => {
          return updatePassword(user, newpwd);
        });
    }
    
    return Promise.reject(new Error('No user logged in'));
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }
}
