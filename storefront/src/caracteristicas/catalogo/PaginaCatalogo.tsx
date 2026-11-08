// el catálogo: lista de productos con búsqueda, filtros y orden.
// los filtros viven en la URL (/productos?q=camiseta&orden=precio-asc),
// así se pueden compartir, funciona el botón de atrás y no se pierden al recargar.
import { useState, type SubmitEvent } from 'react';
import { useSearchParams } from 'react-router';
import type { FiltrosProducto } from '../../api/tipos';
import { Campo } from '../../compartido/componentes/Campo';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { listarCategorias, listarProductos } from './catalogoServicio';
import { ProductoTarjeta } from './ProductoTarjeta';

// cada opción de orden se guarda en la URL como "campo-dirección"
const OPCIONES_ORDEN: Record<string, { texto: string; ordenarPor?: 'precio' | 'nombre'; direccion?: 'asc' | 'desc' }> = {
  '': { texto: 'Por defecto' },
  'nombre-asc': { texto: 'Nombre (A a Z)', ordenarPor: 'nombre', direccion: 'asc' },
  'precio-asc': { texto: 'Precio: menor a mayor', ordenarPor: 'precio', direccion: 'asc' },
  'precio-desc': { texto: 'Precio: mayor a menor', ordenarPor: 'precio', direccion: 'desc' },
};

export default function PaginaCatalogo() {
  useTitulo('Catálogo');

  const [parametros, setParametros] = useSearchParams();

  // lo que está aplicado ahorita, leído de la URL
  const texto = parametros.get('q') ?? '';
  const categoria = parametros.get('categoria') ?? '';
  const minimo = parametros.get('min') ?? '';
  const maximo = parametros.get('max') ?? '';
  const orden = parametros.get('orden') ?? '';

  // lo que se está escribiendo; se aplica hasta que se da clic en "Buscar"
  const [textoEscrito, setTextoEscrito] = useState(texto);
  const [minimoEscrito, setMinimoEscrito] = useState(minimo);
  const [maximoEscrito, setMaximoEscrito] = useState(maximo);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);

  const categorias = useDatos(listarCategorias, []);

  // el servicio no acepta valores vacíos, solo se mandan los filtros que hay
  const filtros: FiltrosProducto = {};
  if (texto) filtros.nombre = texto;
  if (categoria) filtros.categoriaId = Number(categoria);
  if (minimo) filtros.precioMin = Number(minimo);
  if (maximo) filtros.precioMax = Number(maximo);
  if (OPCIONES_ORDEN[orden]?.ordenarPor) {
    filtros.ordenarPor = OPCIONES_ORDEN[orden].ordenarPor;
    filtros.direccion = OPCIONES_ORDEN[orden].direccion;
  }

  const { resultado, recargar } = useDatos(
    () => listarProductos(filtros),
    [texto, categoria, minimo, maximo, orden],
  );

  const hayFiltros = Boolean(texto || categoria || minimo || maximo);

  // cambia un solo parámetro de la URL y deja los demás igual
  function cambiarParametro(nombre: string, valor: string) {
    const nuevos = new URLSearchParams(parametros);

    if (valor) nuevos.set(nombre, valor);
    else nuevos.delete(nombre);

    setParametros(nuevos);
  }

  function alBuscar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();

    const min = minimoEscrito.trim();
    const max = maximoEscrito.trim();

    if ((min && Number(min) < 0) || (max && Number(max) < 0)) {
      setErrorPrecio('El precio no puede ser negativo.');
      return;
    }
    if (min && max && Number(min) > Number(max)) {
      setErrorPrecio('El precio mínimo no puede ser mayor que el máximo.');
      return;
    }
    setErrorPrecio(null);

    const nuevos = new URLSearchParams(parametros);
    const valores = { q: textoEscrito.trim(), min, max };

    for (const [nombre, valor] of Object.entries(valores)) {
      if (valor) nuevos.set(nombre, valor);
      else nuevos.delete(nombre);
    }

    setParametros(nuevos);
  }

  function limpiarFiltros() {
    setTextoEscrito('');
    setMinimoEscrito('');
    setMaximoEscrito('');
    setErrorPrecio(null);

    // el orden se conserva, solo se quitan los filtros
    const nuevos = new URLSearchParams();
    if (orden) nuevos.set('orden', orden);
    setParametros(nuevos);
  }

  const listaCategorias = categorias.resultado.tipo === 'listo' ? categorias.resultado.datos : [];

  return (
    <section className="contenedor pagina">
      <h1 className="pagina__titulo">Catálogo</h1>

      <form className="filtros" onSubmit={alBuscar} noValidate>
        <Campo
          etiqueta="Buscar por nombre"
          name="q"
          type="search"
          placeholder="Ej. camiseta"
          value={textoEscrito}
          onChange={(e) => setTextoEscrito(e.target.value)}
        />

        <div className="filtros__fila">
          <Campo
            etiqueta="Precio mínimo"
            name="min"
            type="number"
            min="0"
            inputMode="decimal"
            value={minimoEscrito}
            onChange={(e) => setMinimoEscrito(e.target.value)}
            error={errorPrecio}
          />
          <Campo
            etiqueta="Precio máximo"
            name="max"
            type="number"
            min="0"
            inputMode="decimal"
            value={maximoEscrito}
            onChange={(e) => setMaximoEscrito(e.target.value)}
          />
        </div>

        <div className="filtros__fila">
          <div className="campo">
            <label className="campo__etiqueta" htmlFor="categoria">
              Categoría
            </label>
            <select
              id="categoria"
              className="campo__entrada"
              value={categoria}
              onChange={(e) => cambiarParametro('categoria', e.target.value)}
            >
              <option value="">Todas</option>
              {listaCategorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="orden">
              Ordenar por
            </label>
            <select
              id="orden"
              className="campo__entrada"
              value={orden}
              onChange={(e) => cambiarParametro('orden', e.target.value)}
            >
              {Object.entries(OPCIONES_ORDEN).map(([valor, opcion]) => (
                <option key={valor} value={valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filtros__acciones">
          <button type="submit" className="boton">
            Buscar
          </button>
          {hayFiltros && (
            <button type="button" className="boton boton--secundario" onClick={limpiarFiltros}>
              Quitar filtros
            </button>
          )}
        </div>
      </form>

      <EstadoDatos
        resultado={resultado}
        alReintentar={recargar}
        estaVacio={(productos) => productos.length === 0}
        tituloVacio={hayFiltros ? 'No encontramos productos' : 'Todavía no hay productos'}
        textoVacio={
          hayFiltros
            ? 'Prueba con otra búsqueda o quita algunos filtros.'
            : 'Estamos preparando el catálogo. Vuelve pronto.'
        }
        accionVacia={
          hayFiltros && (
            <button type="button" className="boton" onClick={limpiarFiltros}>
              Quitar filtros
            </button>
          )
        }
      >
        {(productos) => (
          <>
            <p className="catalogo__cantidad">
              {productos.length === 1 ? '1 producto' : `${productos.length} productos`}
            </p>
            <div className="rejilla">
              {productos.map((producto) => (
                <ProductoTarjeta key={producto.id} producto={producto} />
              ))}
            </div>
          </>
        )}
      </EstadoDatos>
    </section>
  );
}
