import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chercheurheader',
  templateUrl: './chercheurheader.component.html',
  styleUrls: ['./chercheurheader.component.css']
})
export class ChercheurheaderComponent {
 activeLink: string = '';
getFirstName(): string {
  const prenom = localStorage.getItem('prenom') || '';
  return prenom.split(' ')[0]; // Récupère le premier mot avant l'espace
}
 // Informations utilisateur
  user: string = `${this.getFirstName()} ${localStorage.getItem('nom') || ''}`.trim();
  stat: any = localStorage.getItem('role');

  constructor(private router: Router, private user_service : UserService) {}

  ngOnInit(): void {
    this.setActiveFromUrl();
    
  }
  dropdownOpen = false;

  //Dropdown deconnexion
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  hovered: boolean = false;


 //Log out
   logOut(){
        Swal.fire({
      title: 'Vous allez vous déconnecté !',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.user_service.logout();
        this.router.navigate(["/connexion"]);
        console.log('vers connexion')
      }
    })
  }
  setActive(link: string): void {
    this.activeLink = link;
  }

  private setActiveFromUrl(): void {
    const url = this.router.url;

    if (url.includes('/chercheur/accueil')) {
      this.activeLink = 'accueil';
    } else if (url.includes('/chercheur/analyse')) {
      this.activeLink = 'analyse';
    } else if (url.includes('/chercheur/sources')) {
      this.activeLink = 'sources';
    } else if (url.includes('/chercheur/statistiques')) {
      this.activeLink = 'statistiques';
    } 
  }

    chartType = 'line';
    
  
    chart: Chart | null = null;
  
    
  
    chartTypes = [
      { value: 'line', label: 'Courbes', icon: 'bi-graph-up' },
      { value: 'bar', label: 'Barres', icon: 'bi-bar-chart' },
      { value: 'radar', label: 'Radar', icon: 'bi-radar' },
    ];
  
    
  

  
    onChartTypeChange(type: string) {
      this.chartType = type;
    }
  
    
  
    getCurrentTime() {
      return new Date().toLocaleString('fr-FR');
    }
}
