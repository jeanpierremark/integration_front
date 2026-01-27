import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {
private intervalId:any
private intervalId1:any



ngOnInit() {
  const img = new Image();
  img.src = '/assets/img/nuage_ciel.jpg';
  
  this.loading = false; 
}

  
  loading:boolean = true
  constructor( private router:Router 
 ){
     this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            this.loading = true;
          }
    
          if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            setTimeout(() => this.loading = false, 500); 
          }
        });
  }
}
