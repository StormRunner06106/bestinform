import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-booking-confirmed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmed.component.html',
  styleUrls: ['./booking-confirmed.component.scss']
})
export class BookingConfirmedComponent implements OnInit {
  id: string;
  constructor(private activatedRoute: ActivatedRoute, private location: Location, private router: Router,) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.id = params?.id;
    });
  }

  getBack(): void {
    this.location.back();
  }

  getToVoucer(): void {
    this.router.navigate([`/client/dashboard/my-booking/view/${this.id}`]);
  }
}
