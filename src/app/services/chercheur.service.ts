import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChercheurService {

   constructor(private http : HttpClient) { }

     httpOptions = {
    headers: new HttpHeaders({
      'authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'

    })
  };
 
   getMeteovilleOpen(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_open/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }

   getMeteovilleWeather(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_weather/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }

   getMeteovilleOpenWeather(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_openweather/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }

   getlast24havg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/last_24_avg/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }

   getlast7davg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/daily_avg_7/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }

   getlast30davg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/daily_avg_30/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }

  getlasthourdata(bucket:string,ville:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/last_hour_data/'+bucket+'/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }

  getcurrentdata(bucket:string,ville:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/current_data/'+bucket+'/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
   
}
