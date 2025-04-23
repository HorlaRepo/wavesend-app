import { Component } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  ngAfterViewInit() {
    (function ($) {
      $(document).ready(function () {
        $('.owl-carousel.owl-theme').owlCarousel({
          items: 2,
          autoplay: true,
          loop: true,
          center: true,
          margin: 30,
          slideBy: 2,
          stagePadding: 5,
          lazyLoad: true,
          dots: true,
          responsive: {
            0: {
              items: 2 // data-items-xs
            },
            600: {
              items: 2 // data-items-sm
            },
            1000: {
              items: 2 // data-items-md
            },
            1200: {
              items: 2 // data-items-lg
            }
          }
        });
      });
    })(jQuery);
    }
}
