import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAutoDateSlash]',
  standalone: true, // Importante para diretivas em componentes standalone
})
export class AutoDateSlashDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const input = this.el.nativeElement;
    let trimmed = value.replace(/\D/g, ''); // Remove tudo que não for dígito

    if (trimmed.length > 8) {
      trimmed = trimmed.substring(0, 8); // Limita a 8 dígitos (ddmmyyyy)
    }

    let formattedValue = '';
    if (trimmed.length > 0) {
      formattedValue = trimmed.substring(0, 2); // Pega os dois primeiros dígitos (dia)
    }
    if (trimmed.length >= 3) {
      formattedValue += '/' + trimmed.substring(2, 4); // Adiciona a barra e os próximos dois (mês)
    }
    if (trimmed.length >= 5) {
      formattedValue += '/' + trimmed.substring(4, 8); // Adiciona a barra e os próximos quatro (ano)
    }

    // Atualiza o valor no elemento do input
    // É importante definir 'input.value' diretamente para evitar loops de eventos
    // e para que o cursor se posicione corretamente em muitos casos.
    input.value = formattedValue;

    // Se você estiver usando Reactive Forms ou ngModel, pode ser necessário
    // emitir um evento para que o Angular reconheça a mudança programática.
    // input.dispatchEvent(new Event('input')); // Descomente se necessário
  }
}
