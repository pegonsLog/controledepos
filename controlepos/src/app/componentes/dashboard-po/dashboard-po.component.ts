import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DateAdapter, MatDateFormats } from '@angular/material/core';
import { PoService } from '../../services/po.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const PT_BR_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-dashboard-po',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    OverlayModule,
    PortalModule,
    NgxChartsModule,
    RouterLink
  ],
  providers: [DatePipe],
  templateUrl: './dashboard-po.component.html',
  styleUrls: ['./dashboard-po.component.scss']
})
export class DashboardPoComponent implements OnInit {

  private regions: string[] = ['Oeste', 'Barreiro'];

  donutData: any[] = [];
  barData: any[] = [];
  total: number = 0;

  // Período exibido no gráfico
  periodoLabel: string = '';

  // Dimensões responsivas — barras (altura dinâmica por funcionário)
  barView: [number, number] = [900, 400];

  // Opções do gráfico de barras
  gradient: boolean = true;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
      '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6',
      '#F97316', '#6366F1', '#84CC16', '#0EA5E9'
    ]
  };

  // Dois campos de data separados
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  loading: boolean = false;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private poService: PoService,
    private route: ActivatedRoute,
    private datePipe: DatePipe
  ) {
    this.dateAdapter.setLocale('pt-BR');
  }

  ngOnInit(): void {
    this.updateChartView();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    this.range.setValue({ start: startDate, end: endDate });
    this.loadChartData();
  }

  loadChartData(): void {
    const start = this.range.value.start;
    const end = this.range.value.end;
    if (!start || !end) { return; }

    this.loading = true;
    this.periodoLabel = `${this.formatDate(start)} a ${this.formatDate(end)}`;

    forkJoin(
      this.regions.map(region =>
        this.poService.listar(region, '').pipe(
          catchError(err => {
            console.error(`Erro ao carregar região ${region}:`, err);
            return of([]); // garante que o forkJoin não cancele as demais regiões
          })
        )
      )
    ).subscribe({
      next: (results) => {
        const allPos = results.flat();
        const { donutData, barData, total } = this.processPoData(allPos, start, end);
        this.donutData = donutData;
        this.barData = barData;
        this.total = total;
        this.loading = false;
        // Recalcula altura do gráfico de barras agora que temos o nº de funcionários
        this.updateChartView();
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.loading = false;
      }
    });
  }

  onStartDateChange(): void {
    if (this.range.value.start && this.range.value.end) {
      this.loadChartData();
    }
  }

  onEndDateChange(): void {
    if (this.range.value.start && this.range.value.end) {
      this.loadChartData();
    }
  }

  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') ?? '';
  }

  private processPoData(posList: any[], startDate: Date, endDate: Date) {
    const funcionarioMap: Map<string, number> = new Map();

    const parseDate = (str: string): Date | null => {
      if (!str) return null;
      const s = str.trim();

      // Formato dd/MM/yyyy (texto salvo pelo formulário)
      const slashParts = s.split('/');
      if (slashParts.length === 3) {
        const [a, b, c] = slashParts;
        // dd/MM/yyyy
        if (c.length === 4) {
          const d = new Date(+c, +b - 1, +a);
          if (!isNaN(d.getTime())) return d;
        }
        // MM/dd/yyyy (formato americano que o Sheets às vezes retorna)
        if (c.length === 4) {
          const d = new Date(+c, +a - 1, +b);
          if (!isNaN(d.getTime()) && +a <= 12) return d;
        }
      }

      // Formato yyyy-MM-dd (ISO)
      const dashParts = s.split('-');
      if (dashParts.length === 3 && dashParts[0].length === 4) {
        const d = new Date(+dashParts[0], +dashParts[1] - 1, +dashParts[2]);
        if (!isNaN(d.getTime())) return d;
      }

      // Número serial do Google Sheets (dias desde 30/12/1899)
      if (/^\d+$/.test(s)) {
        const serial = parseInt(s, 10);
        const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
        if (!isNaN(d.getTime())) return d;
      }

      // Fallback genérico
      const fallback = new Date(s);
      return isNaN(fallback.getTime()) ? null : fallback;
    };

    const isBetween = (d: Date) => d >= startDate && d <= endDate;

    posList.forEach(po => {
      const dataPo = parseDate(po.data_po);
      if (dataPo && isBetween(dataPo)) {
        const funcionario = po.funcionario_responsavel?.trim() || 'Não informado';
        funcionarioMap.set(funcionario, (funcionarioMap.get(funcionario) ?? 0) + 1);
      }
    });

    const donutData = Array.from(funcionarioMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const total = donutData.reduce((sum, item) => sum + item.value, 0);

    // barData usa o mesmo formato — ordenado do maior para o menor
    const barData = [...donutData];

    return { donutData, barData, total };
  }

  onSelect(event: any): void {}

  xAxisFormat = (value: number): string => Number.isInteger(value) ? String(value) : '';

  @HostListener('window:resize')
  updateChartView(): void {
    const width = Math.max(window.innerWidth - 96, 320);
    const barHeight = Math.max(this.barData.length * 60 + 80, 300);
    this.barView = [width, barHeight];
  }
}
