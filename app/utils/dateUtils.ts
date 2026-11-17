/**
 * Formatea una fecha respetando el día exacto ingresado en el formulario
 * independientemente de la zona horaria del cliente (evita que se reste 1 día por desfase UTC).
 */
export function formatDate(
  dateInput: string | Date | undefined, 
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string {
  if (!dateInput) return '';

  let dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toISOString();
  
  // Extraer la parte de la fecha YYYY-MM-DD
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const day = parseInt(match[3], 10);
    // Creamos la fecha a mediodía local para evitar cualquier salto de día
    const localDate = new Date(year, month, day, 12, 0, 0);
    return localDate.toLocaleDateString('es-CL', options);
  }

  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CL', options);
}
