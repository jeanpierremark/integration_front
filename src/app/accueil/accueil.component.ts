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



//Données Weather
data_weather:any=[]
condition:any


  moisEtAnnee!: string;
  heureActuelle!: string;
  today: Date=new Date();

  //search
  searchText: string = 'Dakar';



  
  loading:boolean = false
  constructor( private router:Router, 
    private user_service:UserService, 
    private chercheur_service : ChercheurService  ){
     this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            this.loading = true;
          }
    
          if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            setTimeout(() => this.loading = false, 500); 
          }
        });
  }


  

  ngOnInit(){
      this.getMeteo()
      this.intervalId = setInterval(() => {
        this.getMeteo()
    }, 600000);

    //Date d'aujourd'hui
      this.intervalId1 = setInterval(() =>{
        this.today= new Date();
        this.moisEtAnnee = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date());
        this.moisEtAnnee = this.moisEtAnnee.charAt(0).toUpperCase() + this.moisEtAnnee.slice(1)
        const heures = this.today.getHours().toString().padStart(2, '0');
        const minutes = this.today.getMinutes().toString().padStart(2, '0');
        this.heureActuelle = `${heures}:${minutes}`;
      },1100)



    }

    ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

    // Traduction 
conditionTraduite(condition: string): string {
  if (condition === "Sunny") {
    return "Ensoleillé";
  } else if (condition === "Partly Cloudy" || condition === "Partially cloudy" || condition === "Partly Cloudy" ) {
    return "Partiellement nuageux";
  } else if (condition === "Cloudy " || condition === "Cloudy") {
    return "Nuageux";
  } else if (condition === "Overcast") {
    return "Couvert";
  } else if (condition === "Patchy rain nearby") {
    return "Pluie éparse à proximité";
  } else if (condition === "Moderate rain") {
    return "Pluie modérée";
  } else if (condition === "Light rain shower") {
    return "Averses de pluie légère";
  } else if (condition === "Thundery outbreaks possible") {
    return "Risque d’orages";
  } else if (condition === "Clear") {
    return "Ciel dégagé";
  } else if (condition === "Heavy rain") {
    return "Forte pluie";
  }else if (condition === "Rain, Partially cloudy"){
    return "Pluie, Partiellement nuageux"
  }else if(condition ==="Rain, Overcast"){
    return "Pluie, couvert"
  }else {
    return condition;
  }
}

getMeteo(){
  this.getmeteoWeather();
}



  //Avoir les données climatiques d'une ville par Weather API
    getmeteoWeather(){
      this.loading = true;
      this.chercheur_service.getMeteovilleWeather(this.searchText).
      subscribe({next:(response) =>{
          if(response.body.message){
              this.data_weather = response.body.data_weather[0];
               console.log(this.data_weather)
              this.condition=this.conditionTraduite(this.data_weather.condition);  
          }
        this.loading = false;

      }})
    }

}
