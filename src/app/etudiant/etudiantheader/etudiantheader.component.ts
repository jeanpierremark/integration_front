import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-etudiantheader',
  templateUrl: './etudiantheader.component.html',
  styleUrls: ['./etudiantheader.component.css']
})
export class EtudiantheaderComponent {


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
        this.user_service.logout_sec().subscribe({
         next : (response=>{
          if(response.body.message=='success'){
            this.user_service.logout();
            this.showToastMessage('success', 'Déconnexion réussie');
            this.router.navigate(["/connexion"]);
            console.log('vers connexion')
          }
         })
        });
      }
    })
  }
  setActive(link: string): void {
    this.activeLink = link;
  }

  private setActiveFromUrl(): void {
    const url = this.router.url;

    if (url.includes('/etudiant/visualisation')) {
      this.activeLink = 'visualisation';
    } else if (url.includes('/etudiant/prevision')) {
      this.activeLink = 'prevision';
    } 
  }
  getProgressBarClass = (type: string) => {
  switch(type) {
    case 'success': return 'custom-progress-bar-success';
    case 'error': return 'custom-progress-bar-error';
    case 'warning': return 'custom-progress-bar-warning';
    case 'info': return 'custom-progress-bar-info';
    default: return 'custom-progress-bar';
  }
};

  showToastMessage(
        type: 'success' | 'error' | 'warning' | 'info' | 'question',
        message: string,
        position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' | 'center' = 'top-end'
      ): void {
        Swal.fire({
          toast: true,
          position: position,
          icon: type,
          title: message,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: 'custom-toast',
            timerProgressBar: this.getProgressBarClass(type)
          }
        });
      }
}
