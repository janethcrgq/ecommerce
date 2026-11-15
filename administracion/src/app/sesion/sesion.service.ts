import {
  computed,
  Injectable,
  signal,
} from '@angular/core';
import {
  HttpBackend,
  HttpClient,
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../api/config';
import { SobreRespuesta } from '../api/tipos';

export type RolUsuario = 'CLIENTE' | 'ADMINISTRADOR';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  telefono: string;
}

interface RespuestaSesion {
  token: string;
  usuario: UsuarioSesion;
}

interface SesionGuardada {
  token: string;
  usuario: UsuarioSesion;
}

const CLAVE_SESION = 'tienda.admin.sesion';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly http: HttpClient;
  private readonly estado = signal<SesionGuardada | null>(this.leerGuardada());

  readonly sesion = this.estado.asReadonly();
  readonly usuario = computed(() => this.estado()?.usuario ?? null);
  readonly token = computed(() => this.estado()?.token ?? null);
  readonly esAdministrador = computed(
    () => this.estado()?.usuario.rol === 'ADMINISTRADOR',
  );

  constructor(handler: HttpBackend) {
    // El login usa un cliente sin interceptor para evitar dependencias circulares.
    this.http = new HttpClient(handler);
  }

  async iniciar(correo: string, contrasenia: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.post<SobreRespuesta<RespuestaSesion>>(
        `${API_URL}/auth/sesion`,
        { correo, contrasenia },
      ),
    );

    if (respuesta.datos.usuario.rol !== 'ADMINISTRADOR') {
      this.cerrar();
      throw new Error('Esta cuenta no tiene acceso al panel administrativo.');
    }

    const nuevaSesion: SesionGuardada = {
      token: respuesta.datos.token,
      usuario: respuesta.datos.usuario,
    };

    localStorage.setItem(CLAVE_SESION, JSON.stringify(nuevaSesion));
    this.estado.set(nuevaSesion);
  }

  cerrar(): void {
    localStorage.removeItem(CLAVE_SESION);
    this.estado.set(null);
  }

  private leerGuardada(): SesionGuardada | null {
    try {
      const contenido = localStorage.getItem(CLAVE_SESION);
      if (!contenido) return null;

      const sesion = JSON.parse(contenido) as SesionGuardada;
      if (sesion.usuario.rol !== 'ADMINISTRADOR') {
        localStorage.removeItem(CLAVE_SESION);
        return null;
      }

      return sesion;
    } catch {
      localStorage.removeItem(CLAVE_SESION);
      return null;
    }
  }
}
