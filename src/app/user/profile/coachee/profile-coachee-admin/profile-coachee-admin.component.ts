import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {Coachee} from "../../../../model/Coachee";
import {ActivatedRoute, Router} from "@angular/router";
import {AdminAPIService} from "../../../../service/adminAPI.service";

@Component({
  selector: 'rb-profile-coachee-admin',
  templateUrl: './profile-coachee-admin.component.html',
  styleUrls: ['./profile-coachee-admin.component.scss']
})
export class ProfileCoacheeAdminComponent implements OnInit, AfterViewInit, OnDestroy {

  private coachee: Observable<Coachee>;
  private subscriptionGetCoachee: Subscription;

  constructor(private router: Router, private cd: ChangeDetectorRef, private apiService: AdminAPIService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.getCoachee();
  }

  private getCoachee() {
    this.subscriptionGetCoachee = this.route.params.subscribe(
      (params: any) => {
        let coacheeId = params['id'];

        this.apiService.getCoachee(coacheeId).subscribe(
          (coachee: Coachee) => {
            console.log("gotCoachee", coachee);
            this.coachee = Observable.of(coachee);
            this.cd.detectChanges();
          }
        );
      }
    )
  }

  goToCoacheesAdmin() {
    window.scrollTo(0, 0);
    this.router.navigate(['admin/coachees-list']);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscriptionGetCoachee) {
      console.log("Unsubscribe coach");
      this.subscriptionGetCoachee.unsubscribe();
    }
  }
}