import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';

export const PT_BR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-dashboard-po',
  standalone: true,
  providers: [{ provide: MAT_DATE_FORMATS, useValue: PT_BR_DATE_FORMATS }],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  templateUrl: './dashboard-po.component.html',
  styleUrls: ['./dashboard-po.component.scss']
})
export class DashboardPoComponent implements OnInit {

  // Dados para os gráficos
  elaboradosData: any[] = [];
  implantadosData: any[] = [];
  comparativoData: any[] = [];

  // Opções dos gráficos
  // Tamanho da área de exibição dos gráficos (largura x altura)
  view: [number, number] = [900, 300];
  gradient: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  showYAxisLabel: boolean = true;
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  colorSchemeLine: Color = {
    name: 'customLine',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28']
  };

  // Filtro de data
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('pt-BR');
  }

  ngOnInit(): void {
    // Define um período padrão (últimos 12 meses)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    this.range.setValue({ start: startDate, end: endDate });

    this.loadChartData();
  }

  loadChartData(): void {
    // Lógica para carregar os dados (aqui usaremos dados mock)
    // No futuro, isso viria de um serviço (this.poService.getDashboardData())
    if (this.range.value.start && this.range.value.end) {
      const mockData = this.generateMockData(this.range.value.start, this.range.value.end);
      this.elaboradosData = mockData.elaborados;
      this.implantadosData = mockData.implantados;
      this.comparativoData = mockData.comparativo;
    }
  }

  onDateChange(): void {
    if (this.range.valid) {
      this.loadChartData();
    }
  }

  onSelect(event: any): void {
    console.log(event);
  }

  private generateMockData(startDate: Date, endDate: Date) {
    const elaborados = [];
    const implantados = [];
    const comparativo: { name: string; series: { name: string; value: number }[] }[] = [
      { name: 'Elaborados', series: [] },
      { name: 'Implantados', series: [] }
    ];

    let currentDate = new Date(startDate);
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    while (currentDate <= endDate) {
      const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear().toString().slice(-2)}`;
      const elaboradosCount = Math.floor(Math.random() * 50) + 10;
      const implantadosCount = Math.floor(Math.random() * elaboradosCount);

      // Dados para gráficos de barra
      elaborados.push({ name: monthYear, value: elaboradosCount });
      implantados.push({ name: monthYear, value: implantadosCount });

      // Dados para gráfico de linha
      comparativo[0].series.push({ name: monthYear, value: elaboradosCount });
      comparativo[1].series.push({ name: monthYear, value: implantadosCount });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { elaborados, implantados, comparativo };
  }
}
