import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  // animations: [
  //   trigger('routeAnimations', [
  //     transition('* <=> *', [
  //       style({ opacity: 0 }),
  //       animate('0.5s', style({ opacity: 1 })),
  //     ]),
  //   ]),
  // ]
})
export class MainComponent implements OnInit {
  ngOnInit(): void {
    console.log('MainComponent initialized');
    // Add debugging to check if component is loading correctly
    try {
      console.log('MainComponent template loading');
    } catch (error) {
      console.error('Error in MainComponent initialization:', error);
    }
  }
  prepareRoute(outlet: any) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
