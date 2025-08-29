import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
  
})
export class LoginComponent {
user: any = []

  passError = false;
  emailError = false;
  telephoneError = false;
 
  loading = true;

  constructor(private user_service:UserService,private router:Router) {
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
    if((email.endsWith("@gmail.com"))||(email.endsWith("@yahoo.com"))||
       (email.endsWith("@hotmail.com"))||(email.endsWith("@hotmail.fr"))||
       (email.endsWith("@yahoo.fr"))){

      this.emailError = false
    }
    else{
      this.emailError = true
    }

  }

  


  loginUser(){
    this.user_service.login(this.user.email,this.user.pass)
          .subscribe({
            next:(response)=>{  
            if(response.body.message == "Success"){
                if(response.body.user.isActive == true ){
                  if(response.body.user.role == "Admin"){
                  this.showToastMessage('success', 'Connexion réussie');
                  this.router.navigate(["/admin/accueil"])
                  
                }
                else if(response.body.user.role == "Chercheur"){
                  this.showToastMessage('success', 'Connexion réussie');
                  this.router.navigate(["/chercheur/accueil"])
                } 
                else{
                  this.showToastMessage('success', 'Connexion réussie');
                  this.router.navigate(["/etudiant/visualisation"])
                }
              }
             
            }           
        },error : (error: HttpErrorResponse) => {
          if(error.error.error == "not found"){
            this.showToastMessage("error", "Email et/ou mot de passe incorrecte");
            console.log(error.error.error)
          }
          else if(error.error.error == "error"){
            this.showToastMessage("error", "Email et/ou mot de passe incorrecte");
            console.log(error.error.error)
            }
          else if(error.error.message=="suspended"){
            this.showToastMessage('error', 'votre compte a été suspendu');

          }
          else{
              console.log(error)
              this.showToastMessage("error", "Erreur au niveau du serveur veuillez réessayer ultérieurement");
            }
        }
    })
  

}




showAlertMessage( title:string, message:string, icon:any ){
  return Swal.fire({

    title: title,
    text: message,
    icon: icon,
    showCloseButton: true,
    //showCancelButton: false,
    confirmButtonColor: '#3085d6',
 
    //confirmButtonText: '',

  }).then((result)=>{
    
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
