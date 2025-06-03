import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateString', // Nome do pipe para usar no template
  standalone: true,
})
export class DateStringPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string' || value.length !== 8 || !/^\d{8}$/.test(value)) {
      // Retorna o valor original (ou um placeholder) se não for uma string de 8 dígitos.
      // Se o valor pode ser null/undefined e você quer exibir '-', ajuste aqui.
      return value || '-'; 
    }
    const day = value.substring(0, 2);
    const month = value.substring(2, 4);
    const year = value.substring(4, 8);
    return `${day}/${month}/${year}`;
  }
}
