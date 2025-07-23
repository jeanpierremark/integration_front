import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ChercheurService } from 'src/app/services/chercheur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chercheurhome',
  templateUrl: './chercheurhome.component.html',
  styleUrls: ['./chercheurhome.component.css']
})
export class ChercheurhomeComponent {
private intervalId:any
private intervalId1:any

  user :any = localStorage.getItem('prenom')+" "+localStorage.getItem('nom');
  stat:any = localStorage.getItem('role');
  
  dropdownOpen = false;

//Données Weather
data_weather:any=[]
condition:any

//Données Open Meteo
open_data : any= []

//Données Visual
visual_data : any = []
condition_visual :any


  moisEtAnnee!: string;
  heureActuelle!: string;
  today: Date=new Date();

  //search
  searchText: string = 'Dakar';

//Dropdown deconnexion
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  //side collapsed
    isSidebarCollapsed = false;

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

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
     if (this.intervalId1) {
      clearInterval(this.intervalId1);
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
  this.getMeteoOpen();
  this.getMeteoVisual();
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

  // Avoir les données climatiques d'une ville par Open Meteo 
  getMeteoOpen(){
    this.loading = true;
    this.chercheur_service.getMeteovilleOpen(this.searchText).subscribe({next : (response)=>{
      if(response.body.message){
        this.open_data = response.body.data_open[0];
        console.log(this.open_data)
      }
      this.loading = false;

    }})
  }

  //Avoir les données climatique depuis visual crossing
  getMeteoVisual(){
    this.loading = true;
    this.chercheur_service.getMeteovilleVisual(this.searchText).subscribe({next : (response)=>{
      if(response.body.message){
        this.visual_data = response.body.data_visual[0];
        console.log(this.visual_data)
        this.condition_visual = this.conditionTraduite(this.visual_data.condition);
        
      }

    this.loading = false;

    }})
  }




 

  temperatures = [24, 20, 15, 12, 25, 18, 25];
  days = ['Dim', 'Lu', 'Ma', 'Mer', 'Jeu', 'Ven', 'Sam'];
  selectedDayIndex = 1;

   tempChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
    datasets: [
      {
        data: [30, 26, 15, 33],
        label: '°C',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  tempChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { min: 10, max: 35 }
    }
  };

  public lineChartType: 'line' = 'line';

  // Average Daily Rainfall Bar Chart
  rainChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.days,
    datasets: [
      {
        data: [8, 12, 6, 9, 3, 4, 7],
        label: 'mm',
        backgroundColor: ['#3b82f6']
      }
    ]
  };

  rainChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  //Log out
   logOut(){
    this.user_service.logout();
    this.router.navigate(["/connexion"]);
    console.log('vers connexion')
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
