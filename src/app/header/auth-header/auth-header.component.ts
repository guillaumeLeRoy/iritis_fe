import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {AuthService} from "../../service/auth.service";
import {Observable, Subscription} from "rxjs";
import {Coach} from "../../model/Coach";
import {Coachee} from "../../model/Coachee";
import {HR} from "../../model/HR";
import {ApiUser} from "../../model/ApiUser";
import {Notif} from "../../model/Notif";
import {CoachCoacheeService} from "../../service/coach_coachee.service";
import {Response} from "@angular/http";
import {PromiseObservable} from "rxjs/observable/PromiseObservable";
import {FirebaseService} from "../../service/firebase.service";
import {MeetingsService} from "../../service/meetings.service";
import {Meeting} from "../../model/Meeting";
import {Utils} from "../../utils/Utils";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CookieService} from "ngx-cookie";

declare var $: any;
declare var Materialize: any;

@Component({
  selector: 'er-auth-header',
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.scss']
})
export class AuthHeaderComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  user: Observable<Coach>;

  @Input()
  isAdmin: boolean = false;

  private mUser: Coach | Coachee | HR
  // private user: BehaviorSubject<ApiUser>;

  private connectedUserSubscription: Subscription;
  private routerEventSubscription: Subscription;
  private readAllNotifSubscription: Subscription;
  private getAvailableMeetingsSubscription: Subscription;
  private getAllNotifSubscription: Subscription;

  private notifications: Observable<Notif[]>;

  private hasAvailableMeetings = false;


  constructor(private router: Router, private meetingService: MeetingsService, private authService: AuthService, private coachCoacheeService: CoachCoacheeService,
              private cd: ChangeDetectorRef) {
    // this.user = new BehaviorSubject(null);
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    // this.getConnectedUser();
    this.onRefreshRequested();

    this.router.events.subscribe((evt) => {
      window.scrollTo(0, 0)
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.onRefreshRequested();
    this.initJS();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');

    if (this.connectedUserSubscription)
      this.connectedUserSubscription.unsubscribe();

    if (this.routerEventSubscription)
      this.routerEventSubscription.unsubscribe();

    if (this.getAvailableMeetingsSubscription)
      this.getAvailableMeetingsSubscription.unsubscribe();

    if (this.getAllNotifSubscription)
      this.getAllNotifSubscription.unsubscribe();

    if (this.readAllNotifSubscription)
      this.readAllNotifSubscription.unsubscribe();
  }

  // getConnectedUser() {
  //   this.connectedUserSubscription = this.authService.getConnectedUserObservable()
  //     .subscribe((user?: Coach | Coachee | HR) => {
  //         console.log("getConnectedUser : " + user);
  //         this.onUserObtained(user);
  //         this.cd.detectChanges();
  //       }
  //     );
  // }

  onRefreshRequested() {
    // this.connectedUserSubscription = this.authService.refreshConnectedUser()
    //   .subscribe((user?: Coach | Coachee | HR) => {
    //       console.log("onRefreshRequested : " + user);
    //       this.onUserObtained(user);
    //       this.cd.detectChanges();
    //     }
    //   );

    if (this.user) {
      this.connectedUserSubscription = this.user.first().subscribe(
        (user: Coach) => {
          console.log("onRefreshRequested, user", user);
          this.onUserObtained(user);
          this.cd.detectChanges();
        });
    }
  }

  private onUserObtained(user: Coach | Coachee | HR) {
    console.log('onUserObtained : ' + user);

    this.mUser = user;


    if (user) {
      this.fetchNotificationsForUser(user);

      if (this.isUserACoach())
        this.getAvailableMeetings();
    }
  }

  onLogout() {
    console.log("login out")
    $('.button-collapse').sideNav('hide');
    this.authService.loginOut();
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }

  goToHome() {
    console.log('goToHome');
    if (!this.isAdmin) {
      console.log('goToHomeUser');
      this.goToMeetings();
    }
    else {
      console.log('goToHomeAdmin');
      this.navigateAdminHome();
    }
  }

  goToWelcomePage() {
    $('.button-collapse').sideNav('hide');
    this.router.navigate(['welcome']);
  }

  goToMeetings() {
    this.router.navigate(['dashboard/meetings']);
  }

  goToAvailableSessions() {
    this.router.navigate(['dashboard/available_meetings']);
  }

  goToProfile() {
    if (this.isUserACoach()) {
      this.router.navigate(['dashboard/profile_coach', this.mUser.id]);
    } else if (this.isUserACoachee()) {
      this.router.navigate(['dashboard/profile_coachee', this.mUser.id]);
    } else if (this.isUserARh()) {
      this.router.navigate(['dashboard/profile_rh', this.mUser.id]);
    }
  }

  // call API to inform that notifications have been read
  // updateNotificationRead() {
  //   let user = this.authService.getConnectedUser();
  //   let obs: Observable<Response>;
  //   if (user != null) {
  //     if (user instanceof Coach) {
  //       let params = [user.id];
  //       obs = this.authService.put(AuthService.PUT_COACH_NOTIFICATIONS_READ, params, null);
  //     } else if (user instanceof Coachee) {
  //       let params = [user.id];
  //       obs = this.authService.put(AuthService.PUT_COACHEE_NOTIFICATIONS_READ, params, null);
  //     }
  //
  //     if (obs != null) {
  //       obs.subscribe((response: Response) => {
  //         console.log('updateNotificationRead response : ' + response);
  //       }).unsubscribe();
  //     }
  //
  //   }
  // }

  isUserACoach(): boolean {
    console.log("test", this.mUser);
    return this.mUser instanceof Coach
  }

  isUserACoachee(): boolean {
    return this.mUser instanceof Coachee
  }

  isUserARh(): boolean {
    return this.mUser instanceof HR
  }

  isEditingProfile(): boolean {
    let profileCoach = new RegExp('/profile_coach');
    let profileCoachee = new RegExp('/profile_coachee');
    let profileRh = new RegExp('/profile_rh');
    return profileCoach.test(this.router.url) || profileCoachee.test(this.router.url) || profileRh.test(this.router.url);
  }

  // canDisplayListOfCoach(): boolean {
  //   if (this.mUser == null)
  //     return false;
  //
  //   if (this.mUser instanceof Coach)
  //     return false;
  //   else
  //     return true;
  // }


  private getAvailableMeetings() {
    this.getAvailableMeetingsSubscription = this.meetingService.getAvailableMeetings().subscribe(
      (meetings: Meeting[]) => {
        console.log('got getAvailableMeetings', meetings);
        if (meetings != null && meetings.length > 0) this.hasAvailableMeetings = true;
        this.cd.detectChanges();
      }
    );
  }

  private fetchNotificationsForUser(user: ApiUser) {

    let param = user
    this.getAllNotifSubscription = this.coachCoacheeService.getAllNotificationsForUser(param).subscribe(
      (notifs: Notif[]) => {
        console.log('fetchNotificationsForUser : ' + notifs);

        //Sort notifs by date
        if (notifs != null) {
          notifs.sort(function (a, b) {
            let d1 = new Date(a.date);
            let d2 = new Date(b.date);
            let res = d1.getUTCFullYear() - d2.getUTCFullYear();
            if (res === 0)
              res = d1.getUTCMonth() - d2.getUTCMonth();
            if (res === 0)
              res = d1.getUTCDate() - d2.getUTCDate();
            if (res === 0)
              res = d1.getUTCHours() - d2.getUTCHours();
            return res;
          });
        }

        this.notifications = Observable.of(notifs);
        this.cd.detectChanges();
      }
    );
  }

  printDateString(date: string) {
    return Utils.dateToString(date) + ' - ' + Utils.getHoursAndMinutesFromDate(date);
  }

  readAllNotifications() {
    this.readAllNotifSubscription = this.coachCoacheeService.readAllNotificationsForUser(this.mUser).subscribe(
      (response: Response) => {
        console.log("getAllNotifications OK", response);
        this.fetchNotificationsForUser(this.mUser);
        this.cd.detectChanges();
      }
    );
  }


  /******* Admin page *****/
  navigateAdminHome() {
    console.log("navigateAdminHome");
    this.router.navigate(['/admin']);
  }

  navigateToSignup() {
    console.log("navigateToSignup");
    this.router.navigate(['admin/signup']);
  }

  navigateToCoachsList() {
    console.log("navigateToCoachsList");
    this.router.navigate(['admin/coachs-list']);
  }

  navigateToCoacheesList() {
    console.log("navigateToCoacheesList");
    this.router.navigate(['admin/coachees-list']);
  }

  navigateToRhsList() {
    console.log("navigateToRhsList");
    this.router.navigate(['admin/rhs-list']);
  }

  navigateToPossibleCoachsList() {
    console.log("navigateToPossibleCoachsList")
    this.router.navigate(['admin/possible_coachs-list']);
  }


  initJS() {
    $('.button-collapse').sideNav({
      menuWidth: 400,
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true,
      draggable: true // Choose whether you can drag to open on touch screens
    });

    $('.dropdown-button-notifs').dropdown({
      inDuration: 300,
      outDuration: 125,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on click
      alignment: 'right', // Aligns dropdown to left or right edge (works with constrain_width)
      gutter: 0, // Spacing from edge
      belowOrigin: true // Displays dropdown below the button
    });

    $('.dropdown-button-profile').dropdown({
      inDuration: 300,
      outDuration: 125,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on click
      alignment: 'right', // Aligns dropdown to left or right edge (works with constrain_width)
      gutter: 0, // Spacing from edge
      belowOrigin: true // Displays dropdown below the button
    });
  }
}
