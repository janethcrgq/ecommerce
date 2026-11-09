// el carrito del cliente, disponible para toda la aplicación.
// así el contador del encabezado, el detalle de producto y la pantalla del carrito
// siempre ven lo mismo. se usa con el hook useCarrito().
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ErrorApi } from '../../api/errores';
import type { CarritoDetalle } from '../../api/tipos';
import type { ResultadoDatos } from '../../compartido/hooks/useDatos';
import { useSesion } from '../sesion/SesionContext';
import * as servicio from './carritoServicio';

interface ValorCarrito {
  // cargando, error o listo, igual que en las demás pantallas
  resultado: ResultadoDatos<CarritoDetalle>;
  // cuántas piezas hay en total, para el contador del encabezado
  cantidadPiezas: number;
  recargar: () => void;
  agregar: (varianteId: number, cantidad: number) => Promise<void>;
  cambiarCantidad: (varianteId: number, cantidad: number) => Promise<void>;
  quitar: (varianteId: number) => Promise<void>;
  vaciar: () => Promise<void>;
}

const CarritoContext = createContext<ValorCarrito | null>(null);

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const [resultado, setResultado] = useState<ResultadoDatos<CarritoDetalle>>({ tipo: 'cargando' });

  // "silencioso" es para no tapar la pantalla con el círculo de carga
  // cuando solo se cambió una cantidad
  async function cargar(silencioso: boolean) {
    if (!silencioso) setResultado({ tipo: 'cargando' });

    try {
      setResultado({ tipo: 'listo', datos: await servicio.obtenerCarrito() });
    } catch (error) {
      setResultado({
        tipo: 'error',
        error: error instanceof ErrorApi
          ? error
          : new ErrorApi('Ocurrió un problema inesperado. Intenta de nuevo.', 'otro'),
      });
    }
  }

  // solo los clientes tienen carrito. al entrar o salir alguien, se vuelve a pedir
  useEffect(() => {
    if (usuario?.rol === 'CLIENTE') {
      cargar(false);
    } else {
      setResultado({ tipo: 'cargando' });
    }
  }, [usuario?.id, usuario?.rol]);

  // cada cambio se manda al servicio y luego se pide el carrito completo,
  // para mostrar los subtotales y el total que calculó el servicio
  async function agregar(varianteId: number, cantidad: number) {
    await servicio.agregarAlCarrito(varianteId, cantidad);
    await cargar(true);
  }

  async function cambiarCantidad(varianteId: number, cantidad: number) {
    await servicio.cambiarCantidad(varianteId, cantidad);
    await cargar(true);
  }

  async function quitar(varianteId: number) {
    await servicio.quitarDelCarrito(varianteId);
    await cargar(true);
  }

  async function vaciar() {
    await servicio.vaciarCarrito();
    await cargar(true);
  }

  const cantidadPiezas = resultado.tipo === 'listo'
    ? resultado.datos.items.reduce((suma, item) => suma + item.cantidad, 0)
    : 0;

  return (
    <CarritoContext
      value={{
        resultado,
        cantidadPiezas,
        recargar: () => cargar(false),
        agregar,
        cambiarCantidad,
        quitar,
        vaciar,
      }}
    >
      {children}
    </CarritoContext>
  );
}

export function useCarrito() {
  const valor = useContext(CarritoContext);

  if (!valor) {
    throw new Error('useCarrito() tiene que usarse dentro del componente <ProveedorCarrito>');
  }

  return valor;
}
