import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from './config';
import { SobreRespuesta } from './tipos';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(ruta: string, parametros?: Record<string, string | number | boolean | undefined>): Observable<T> {
    let params = new HttpParams();

    for (const [clave, valor] of Object.entries(parametros ?? {})) {
      if (valor !== undefined && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }

    return this.http
      .get<SobreRespuesta<T>>(`${API_URL}${ruta}`, { params })
      .pipe(map((respuesta) => respuesta.datos));
  }

  post<T>(ruta: string, cuerpo: unknown): Observable<T> {
    return this.http
      .post<SobreRespuesta<T>>(`${API_URL}${ruta}`, cuerpo)
      .pipe(map((respuesta) => respuesta.datos));
  }

  patch<T>(ruta: string, cuerpo: unknown): Observable<T> {
    return this.http
      .patch<SobreRespuesta<T>>(`${API_URL}${ruta}`, cuerpo)
      .pipe(map((respuesta) => respuesta.datos));
  }

  put<T>(ruta: string, cuerpo: unknown): Observable<T> {
    return this.http
      .put<SobreRespuesta<T>>(`${API_URL}${ruta}`, cuerpo)
      .pipe(map((respuesta) => respuesta.datos));
  }

  delete<T>(ruta: string): Observable<T> {
    return this.http
      .delete<SobreRespuesta<T>>(`${API_URL}${ruta}`)
      .pipe(map((respuesta) => respuesta.datos));
  }
}
