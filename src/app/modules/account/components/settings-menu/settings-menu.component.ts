import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.css']
})
export class SettingsMenuComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {}


  ngOnInit(): void {
    const linkColor = document.querySelectorAll('.nav-link');

    const setActiveClass = () => {
      const currentUrl = this.router.url;
      linkColor.forEach((link: Element) => {
        const href = (link as HTMLAnchorElement).getAttribute('routerLink');
        // Adjust to handle both absolute and relative paths
        if (currentUrl === href || currentUrl === `/${href}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    // Set the active class on page load
    setActiveClass();

    // Add click event listener to update the active class on click
    linkColor.forEach(link => {
      link.addEventListener('click', () => {
        linkColor.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // Subscribe to router events to update the active class on URL change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setActiveClass();
    });
  }
  // ngOnInit(): void {
  //   const linkColor = document.querySelectorAll('.nav-link');
  //   linkColor.forEach((link, index) => {
  //     if (index === 0) {
  //       link.classList.add('active');
  //     }
  //     link.addEventListener('click', () => {
  //       linkColor.forEach(nav => nav.classList.remove('active'));
  //       link.classList.add('active');
  //     })
  //   });
  // }


  // ngAfterViewInit(): void {
  //   const linkColor = document.querySelectorAll('.nav-link');
  //   linkColor.forEach((link, index) => {
  //     if (index === 0) {
  //       link.classList.add('active');
  //     }
  //     link.addEventListener('click', () => {
  //       linkColor.forEach(nav => nav.classList.remove('active'));
  //       link.classList.add('active');
  //     })
  //   });
  // }

}
