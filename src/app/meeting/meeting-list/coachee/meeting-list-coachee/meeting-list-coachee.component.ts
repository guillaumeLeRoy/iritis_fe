import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MeetingsService} from "../../../../service/meetings.service";
import {Observable} from "rxjs/Observable";
import {Meeting} from "../../../../model/Meeting";
import {Subscription} from "rxjs/Subscription";
import {Coachee} from "../../../../model/Coachee";
import {AuthService} from "../../../../service/auth.service";

declare var $: any;
declare var Materialize: any;

@Component({
  selector: 'er-meeting-list-coachee',
  templateUrl: './meeting-list-coachee.component.html',
  styleUrls: ['./meeting-list-coachee.component.scss']
})
export class MeetingListCoacheeComponent implements OnInit, AfterViewInit, OnDestroy {

  loading = true;

  @Input()
  user: Observable<Coachee>;

  @Input()
  isAdmin: boolean = false;

  private meetings: Observable<Array<Meeting>>;
  private meetingsOpened: Observable<Array<Meeting>>;
  private meetingsClosed: Observable<Array<Meeting>>;
  private meetingsArray: Array<Meeting>;

  private hasOpenedMeeting = false;
  private hasClosedMeeting = false;

  private userSubscription?: Subscription;
  private getAllMeetingsForCoacheeIdSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  private meetingToCancel: Meeting;

  private rateSessionMeetingId: string
  private sessionRate = '0';
  private sessionPreRate = '0';

  constructor(private meetingsService: MeetingsService, private authService: AuthService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.loading = true;
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.userSubscription = this.user.subscribe((user: Coachee) => {
      this.onUserObtained(user);
    });
  }

  ngOnDestroy(): void {
    if (this.getAllMeetingsForCoacheeIdSubscription) {
      this.getAllMeetingsForCoacheeIdSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private onRefreshAllRequested() {
    console.log('onRefreshAllRequested');
    // call API GET user
    this.authService.refreshConnectedUser();
  }

  private onUserObtained(user: Coachee) {
    console.log('onUserObtained, user : ', user);
    if (user) {//todo can be null ? so loading always true ??
      this.getAllMeetingsForCoachee(user.id);
    }
  }

  private getAllMeetingsForCoachee(coacheeId: string) {
    this.loading = true;
    this.getAllMeetingsForCoacheeIdSubscription = this.meetingsService.getAllMeetingsForCoacheeId(coacheeId, this.isAdmin)
      .subscribe(
        (meetings: Meeting[]) => {
          console.log('got meetings for coachee', meetings);
          this.onMeetingsObtained(meetings);
        }, (error) => {
          console.log('got meetings for coachee ERROR', error);
          this.loading = false;
        }
      );
  }

  private onMeetingsObtained(meetings: Array<Meeting>) {
    console.log('got meetings for coachee', meetings);

    this.meetingsArray = meetings;
    this.meetings = Observable.of(meetings);
    this.getOpenedMeetings();
    this.getClosedMeetings();
    this.loading = false;

    console.log('got meetings, loading', this.loading);

    this.cd.detectChanges();
  }

  private getOpenedMeetings() {
    console.log('getOpenedMeetings');
    if (this.meetingsArray != null) {
      let opened: Array<Meeting> = new Array<Meeting>();
      for (let meeting of this.meetingsArray) {
        if (meeting.isOpen) {
          console.log('getOpenedMeetings, add open meeting');

          opened.push(meeting);
          this.hasOpenedMeeting = true;
        }
      }
      this.meetingsOpened = Observable.of(opened);
    }
  }

  private getClosedMeetings() {
    console.log('getClosedMeetings');
    if (this.meetingsArray != null) {
      let closed: Meeting[] = [];
      for (let meeting of this.meetingsArray) {
        if (!meeting.isOpen) {
          console.log('getClosedMeetings, add close meeting');

          closed.push(meeting);
          this.hasClosedMeeting = true;
        }
      }
      this.meetingsClosed = Observable.of(closed);
    }
  }

  /*************************************
   ----------- Modal control ------------
   *************************************/

  coacheeDeleteModalVisibility(isVisible: boolean) {
    if (isVisible) {
      $('#coachee_delete_meeting_modal').openModal();
    } else {
      $('#coachee_delete_meeting_modal').closeModal();
    }
  }

  openCoacheeDeleteMeetingModal(meeting: Meeting) {
    this.meetingToCancel = meeting;
    this.coacheeDeleteModalVisibility(true);
  }

  cancelCoacheeDeleteMeeting() {
    this.coacheeDeleteModalVisibility(false);
    this.meetingToCancel = null;
  }

  validateCoacheeDeleteMeeting() {
    console.log('validateCoacheeDeleteMeeting');

    let meetingId = this.meetingToCancel.id;

    this.coacheeDeleteModalVisibility(false);
    this.meetingToCancel = null;

    this.meetingsService.deleteMeeting(meetingId).subscribe(
      (response) => {
        console.log('confirmCancelMeeting, res', response);
        this.onRefreshAllRequested();
        Materialize.toast('Meeting supprimé !', 3000, 'rounded');
      }, (error) => {
        console.log('confirmCancelMeeting, error', error);
        Materialize.toast('Impossible de supprimer le meeting', 3000, 'rounded');
      }
    );
  }

  /*************************************
   ----------- Modal control - rate session ------------
   *************************************/

  setSessionRate(value: number) {
    this.sessionRate = value.toString();
  }

  setSessionPreRate(value: number) {
    this.sessionPreRate = value.toString();
  }

  updateRateSessionModalVisibility(isVisible: boolean) {
    if (isVisible) {
      $('#rate_session_modal').openModal();
    } else {
      $('#rate_session_modal').closeModal();
    }
  }

  openRateSessionModal(meetingId: string) {
    this.rateSessionMeetingId = meetingId;
    this.updateRateSessionModalVisibility(true);
  }

  cancelRateSessionModal() {
    this.updateRateSessionModalVisibility(false);
    this.rateSessionMeetingId = null;
    this.sessionRate = null;
  }

  validateRateSessionModal() {
    console.log('validateRateSessionModal');

    this.meetingsService.addSessionRateToMeeting(this.rateSessionMeetingId, this.sessionRate).subscribe(
      (response) => {
        console.log('validateRateSessionModal, res', response);
        this.onRefreshAllRequested();
        this.updateRateSessionModalVisibility(false);
        Materialize.toast('Votre coach vient d\'être noté !', 3000, 'rounded');
      }, (error) => {
        console.log('validateRateSessionModal, error', error);
        this.updateRateSessionModalVisibility(false);
        Materialize.toast('Impossible de noter votre coach', 3000, 'rounded');
      }
    );
  }

}
