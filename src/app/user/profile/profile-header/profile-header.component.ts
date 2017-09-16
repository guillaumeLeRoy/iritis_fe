import {Component, Input, OnInit} from '@angular/core';
import {ApiUser} from "../../../model/ApiUser";
import {Coachee} from "../../../model/coachee";
import {HR} from "../../../model/HR";
import {Coach} from "../../../model/Coach";
import {Location} from "@angular/common";
import {PossibleCoach} from "../../../model/PossibleCoach";

@Component({
  selector: 'rb-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent implements OnInit {

  @Input()
  user: (Coach | Coachee | HR | PossibleCoach);

  @Input()
  isOwner: boolean;

  constructor(private location: Location) { }

  ngOnInit() {
  }

  goBack() {
      this.location.back();
  }

  isCoach(user: ApiUser) {
    return user instanceof Coach
  }
}
