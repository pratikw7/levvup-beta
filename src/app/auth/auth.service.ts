import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from './user.model';
import { AllService } from '../services/all.service';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase.config';

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
    return from(this.checkAuthState()).pipe(
      map(user => {
        if (user) {
          this._user.next(user);
          return user;
        }
        return null;
      })
    );
  }

  private async checkAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          console.log('🔥 checkAuthState: User found', user.uid, user.email);
          const token = await user.getIdToken();
          const userObj = new User(
            user.uid,
            user.email || '',
            token,
            new Date(Date.now() + 3600000) // 1 hour from now
          );
          
          // Make sure we update the user state
          this._user.next(userObj);
          
          // Store email in localStorage for guard compatibility
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            console.log('🔥 checkAuthState: Email stored in localStorage:', user.email);
          }
          
          resolve(userObj);
        } else {
          console.log('🔥 checkAuthState: No user found');
          resolve(null);
        }
      });
    });
  }

  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        if (user) {
          // Get the user token
          const token = await user.getIdToken();
          
          // Create user object
          const userObj = new User(
            user.uid,
            user.email || '',
            token,
            new Date(Date.now() + 3600000) // 1 hour from now
          );
          
          // Update the user state
          this._user.next(userObj);
          
          // Store user data in Firestore
          try {
            await setDoc(doc(firestore, 'users', user.uid), {
              email: user.email,
              createdAt: new Date()
            });
          } catch (firestoreError) {
            console.warn('Firestore error (non-critical):', firestoreError);
          }
          
          // Add user to app's user database (make it async and non-blocking)
          try {
            console.log('🔥 Adding user to app database...');
            // Make this non-blocking by not awaiting it
            setTimeout(() => {
              try {
                this.allService.addUserToDB(email);
                console.log('🔥 User added to app database successfully');
              } catch (dbError) {
                console.warn('🔥 App database error (non-critical):', dbError);
              }
            }, 100);
          } catch (dbError) {
            console.warn('App database error (non-critical):', dbError);
          }
          
          return user;
        }
        throw new Error('User creation failed');
      })
      .catch((error) => {
        console.error('Signup error:', error);
        throw error;
      });
  }

  login(email: string, password: string) {
    console.log('🔥 AuthService: Starting login for', email);
    console.log('🔥 Auth instance:', auth ? 'Ready' : 'Not initialized');
    
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('🔥 Firebase signIn successful:', userCredential);
        const user = userCredential.user;
        if (user) {
          console.log('🔥 User object obtained:', user.uid);
          
          // Get the user token
          const token = await user.getIdToken();
          console.log('🔥 Token obtained successfully');
          
          // Create user object
          const userObj = new User(
            user.uid,
            user.email || '',
            token,
            new Date(Date.now() + 3600000) // 1 hour from now
          );
          
          // Update the user state
          this._user.next(userObj);
          console.log('🔥 User state updated in BehaviorSubject');
          
          // Store email in localStorage for service compatibility
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            console.log('🔥 Login: Email stored in localStorage:', user.email);
          }
          
          this.mauth = auth;
          console.log('🔥 Login completed successfully');
          return user;
        }
        console.error('🔥 No user in credential');
        throw new Error('Login failed');
      })
      .catch((error) => {
        console.error('🔥 Login error details:', {
          code: error.code,
          message: error.message,
          customData: error.customData,
          stack: error.stack
        });
        throw error;
      });
  }

  logout() {
    auth.signOut();
    this._user.next(null);
    this.router.navigateByUrl('/auth');
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = null;
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  changePassword(oldpwd: string, newpwd: string) {
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
