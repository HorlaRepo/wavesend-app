import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`, // Minimal template with just router outlet
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Wavesend';
}