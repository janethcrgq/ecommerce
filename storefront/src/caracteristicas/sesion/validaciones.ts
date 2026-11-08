// las reglas de los campos de los formularios de sesión.
// son las mismas que revisa el servicio, así el error sale antes de mandar nada.
// cada función regresa el mensaje de error, o null si el valor está bien.

export function validarNombre(nombre: string): string | null {
  if (nombre.trim() === '') return 'Escribe tu nombre.';
  if (nombre.trim().length > 100) return 'El nombre es demasiado largo.';
  return null;
}

export function validarCorreo(correo: string): string | null {
  if (correo.trim() === '') return 'Escribe tu correo.';
  if (!/^\S+@\S+\.\S+$/.test(correo.trim())) return 'Escribe un correo válido, como ana@correo.com.';
  return null;
}

export function validarContrasenia(contrasenia: string): string | null {
  if (contrasenia === '') return 'Escribe tu contraseña.';
  if (contrasenia.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

export function validarTelefono(telefono: string): string | null {
  if (telefono.trim() === '') return 'Escribe tu teléfono.';
  if (!/^[0-9]{10}$/.test(telefono.trim())) return 'El teléfono debe tener 10 dígitos.';
  return null;
}
