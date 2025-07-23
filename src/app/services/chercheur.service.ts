import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChercheurService {

   constructor(private http : HttpClient) { }
 
   getMeteovilleOpen(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_open/'+ville,{observe:'response'})
   }

   getMeteovilleWeather(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_weather/'+ville,{observe:'response'})
   }

   getMeteovilleVisual(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_visual/'+ville,{observe:'response'})
   }
}
