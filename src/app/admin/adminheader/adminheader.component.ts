import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adminheader',
  templateUrl: './adminheader.component.html',
  styleUrls: ['./adminheader.component.css']
})
export class AdminheaderComponent {
activeLink: string = '';
getFirstName(): string {
  const prenom = sessionStorage.getItem('prenom') || '';
  return prenom.split(' ')[0]; // Récupère le premier mot avant l'espace
}
 // Informations utilisateur
  user: string = `${this.getFirstName()} ${sessionStorage.getItem('nom') || ''}`.trim();
  stat: any = sessionStorage.getItem('role');

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
      title: 'Vous allez vous déconnecter !',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.user_service.logout_sec().subscribe({
         next : (response)=>{
          if(response.body.message=='success'){
            this.user_service.logout();
            this.showToastMessage('success', 'À bientôt ');
            this.router.navigate(["/connexion"]);
            console.log('vers connexion')
          }
         },error : (error) => {
            if (error.error.message == "Token expiré"){
              this.user_service.logout()
              this.router.navigate(["/connexion"])
            }
      }
        });
      }
    })
  }
  setActive(link: string): void {
    this.activeLink = link;
  }

  private setActiveFromUrl(): void {
    const url = this.router.url;

    if (url.includes('/admin/accueil')) {
      this.activeLink = 'accueil';
    } else if (url.includes('/admin/user')) {
      this.activeLink = 'user';
    } else if (url.includes('/admin/connexion')) {
      this.activeLink = 'connexion'
    }else if (url.includes('/admin/activite')) {
      this.activeLink = 'activite';
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
