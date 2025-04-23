import { Component, AfterViewInit } from '@angular/core';

declare var $: any;
declare var jQuery: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ngAfterViewInit() {
    (function ($) {
      $(document).ready(function () {
        $('.owl-carousel.owl-theme.single-slideshow').owlCarousel({
          nav: true,
          navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
          items: 1,
          autoplay: true,
          src: 'https://youtube.com',
          loop: true,
          center: true,
          margin: 0,
          lazyLoad: true,
          dots: true
        });
      });
    })(jQuery);

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
