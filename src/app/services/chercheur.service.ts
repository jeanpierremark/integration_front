import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChercheurService {

   constructor(private http : HttpClient) { }

     httpOptions = {
    headers: new HttpHeaders({
      'authorization': `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json'

    })
  };
//Get data from open meteo
   getMeteovilleOpen(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_open/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
//Get data from weather api
   getMeteovilleWeather(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_weather/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
// Get data from openweather
   getMeteovilleOpenWeather(ville:string){
     return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/meteo_openweather/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 24h avg
   getlast24havg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/last_24_avg/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 7 days avg
   getlast7davg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/daily_avg_7/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 30 days avg
   getlast30davg(bucket:string,ville:string,param:string){
    return this.http.get<any>(' http://localhost:3001/data_chercheur/api/chercheur/daily_avg_30/'+bucket+'/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Last hour data from bucket 
  getlasthourdata(bucket:string,ville:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/last_hour_data/'+bucket+'/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
//Current data from bucket 
  getcurrentdata(bucket:string,ville:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/current_data/'+bucket+'/'+ville,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 7 days from weather API
   getlast7weather(ville:string,param:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/last7weather/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 7 days from open weather
   getlast7meteo(ville:string,param:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/last7meteo/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Last 7 days from open weather
   getlast7open(ville:string,param:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/last7open/'+ville+'/'+param,{observe:'response',headers: this.httpOptions.headers})
   }
//Descriptive analysis
  get_descriptive_analysis(ville:any,source:string,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/descriptive/'+ville+'/'+source+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
//Trend analysis
  get_trend_analysis(ville:any,source:string,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/tendances/'+ville+'/'+source+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
//Correlation analysis
  get_correlation_analysis(ville:any,source:string,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/correlation/'+ville+'/'+source+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
//Comparitive  analysis
  get_direct_comparaison(ville:any,source:string,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/comparative/'+ville+'/'+source+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
  //Descriptive  analysis
  get_descriptive_from_etl (ville:any,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/descriptive_sqlserver/'+ville+'/'+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
  //Tendance  analysis
  get_tendance_from_etl (ville:any,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/tendances_sqlserver/'+ville+'/'+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
  //Correlation  analysis
  get_correlation_from_etl (ville:any,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/correlation_sqlserver/'+ville+'/'+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
  //Correlation  analysis
  get_comparaison_from_etl (ville:any,params:any,period:string){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/comparative_sqlserver/'+ville+'/'+'/'+params+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }

  //Correlation  analysis
  get_prevision(ville:any,period:any){
    return this.http.get<any>('http://localhost:3001/data_chercheur/api/chercheur/prevision/'+ville+'/'+period,{observe:'response',headers: this.httpOptions.headers})
   }
}
