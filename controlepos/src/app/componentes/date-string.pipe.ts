import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateString', // Nome do pipe para usar no template
  standalone: true,
})
export class DateStringPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') {
      return ''; // Retorna string vazia para nulo/undefined/string vazia ou não string
    }

    // Tenta formatar como DD/MM/YY para strings de 6 dígitos (DDMMYY)
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const day = value.substring(0, 2);
      const month = value.substring(2, 4);
      const year = value.substring(4, 6); // YY
      return `${day}/${month}/${year}`;
    }

    // Tenta formatar como DD/MM/YYYY para strings de 8 dígitos (DDMMYYYY)
    if (value.length === 8 && /^\d{8}$/.test(value)) {
      const day = value.substring(0, 2);
      const month = value.substring(2, 4);
      const year = value.substring(4, 8); // YYYY
      return `${day}/${month}/${year}`;
    }

    // Se não corresponder a nenhum formato esperado, retorna o valor original
    return value;
  }
}
