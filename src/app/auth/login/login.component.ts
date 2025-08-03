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
    console.log(this.user.email)
    console.log(this.user.pass)
    this.user_service.login(this.user.email,this.user.pass)
          .subscribe({
            next:(response)=>{  
            if(response.body.message =="Success"){
              if(response.body.user.role == "Admin"){
                this.showAlertMessage("Success","Bienvenu(e) "+response.body.user.prenom+" "+response.body.user.nom ,"success")
                this.router.navigate(["/admin"])
              }
              else if(response.body.user.role == "Chercheur"){
                this.showAlertMessage("Success","Bienvenu(e) "+response.body.user.prenom+" "+response.body.user.nom ,"success")
                this.router.navigate(["/chercheur/accueil"])
              } 
              else{
                this.showAlertMessage("Success","Bienvenu(e) "+response.body.user.prenom+" "+response.body.user.nom ,"success")
                this.router.navigate(["/etudiant"])
              }
            }           
        },error : (error: HttpErrorResponse) => {
          if(error.error.error == "not found"){
          this.showAlertMessage("Error","User does not exist","error")
          console.log(error.error.error)
          }
          else if(error.error.error == "error"){
            this.showAlertMessage("Error","Incorrect email or/and password ","error")
            console.log(error.error.error)
            }
            else{
              console.log(error)
              this.showAlertMessage("Error","Internal Server Error ","error")
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
}
