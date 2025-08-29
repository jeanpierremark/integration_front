import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone : false,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    prenom :"",
    nom : "",
    email : "",
    password : "",
    role :"Etudiant",
    genre : "M",
    age : 18,
  }
  passConf!:string
  
  
  
  passError = false;
  passConfError = false;
  emailError = false;
  
  loading = true;

  constructor(private user_service : UserService, private router:Router){
     this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            this.loading = true;
          }
    
          if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            setTimeout(() => this.loading = false, 500); // un petit délai pour le style
          }
        });
       }
  emailVerif(email:string){

    if((email.endsWith("@gmail.com"))||(email.endsWith("@yahoo.com"))||(email.endsWith("@hotmail.com")) ||(email.endsWith("@hotmail.fr"))||(email.endsWith("@yahoo.fr"))){
      this.emailError = false
    }
    else{
      this.emailError = true
    }

  }

  passwordLengthVerif(pass1: string): void {
  // Vérifie longueur du mot de passe
  if (pass1.length < 6) {
    this.passError = true;
  } else {
    // Si valide, on masque l’erreur après un court délai
    if (this.passError) {
      setTimeout(() => {
        this.passError = false;
      }, 500);
    }
  }

  // Vérifie la confirmation si elle existe
  if (this.passConf !== undefined && this.passConf !== '') {
    this.passConfError = this.passConf !== pass1;
  }
}

passwordConfirmVerif(pass1:string, pass2:string){
    if(pass1 != pass2){
      this.passConfError=true
    }else{
      this.passConfError=false
    }

  }

  registerUser(){
    this.user_service.register(
      this.user.prenom,
      this.user.nom,
      this.user.email,
      this.user.password,
      this.user.role,
      this.user.genre,
      this.user.age,
    ).subscribe({
      next:(data) => {
         if(data.body.message == "Success"){
         this.router.navigate(["/connexion"])
         this.showToastMessage("success","Informations enregistrées avec succès")
        
        }
        else{
          this.router.navigate(["/inscription"])
          this.showToastMessage("error","Erreur d'enregistrement veullez réessayer")
        }

      },
      error:(err) => {
        this.router.navigate(["/inscription"])
          this.showToastMessage("error","Erreur au niveau du serveur veullez réessayer")

      }
    })
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
            timerProgressBar: this.getProgressBarClass(type)
          }
        });
      }
}
