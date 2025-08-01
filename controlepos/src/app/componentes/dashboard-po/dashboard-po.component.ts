import { Component, OnInit } from '@angular/core';
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
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { PoService } from '../../services/po.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  imports: [
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
  templateUrl: './dashboard-po.component.html',
  styleUrls: ['./dashboard-po.component.scss']
})
export class DashboardPoComponent implements OnInit {

  // Regiões que terão gráficos separados
  regions: string[] = ['Oeste', 'Barreiro'];

  // Estrutura de dados por região
  // Propriedade auxiliar para compatibilidade com bloco antigo (será removido quando HTML for limpo)
  region: string = 'Oeste';

  dataByRegion: { [region: string]: { elaborados: any[]; implantados: any[]; comparativo: any[] } } = {
    Oeste: { elaborados: [], implantados: [], comparativo: [] },
    Barreiro: { elaborados: [], implantados: [], comparativo: [] }
  };

  // Opções dos gráficos
  // Tamanho da área de exibição dos gráficos (largura x altura)
  view: [number, number] = [900, 300];
  gradient: boolean = true;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  showLegend: boolean = false; // Legenda removida
  showDataLabel: boolean = true; // Rótulos de dados adicionados
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

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private poService: PoService,
    private route: ActivatedRoute
  ) {
    this.dateAdapter.setLocale('pt-BR');
  }

  ngOnInit(): void {
    // Inicializa intervalo padrão de datas e carrega dados para todas as regiões
    this.initializeDateRangeAndLoad();
  }

  private initializeDateRangeAndLoad(): void {
    // Define um período padrão (últimos 12 meses)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    this.range.setValue({ start: startDate, end: endDate });

    this.loadChartData();
  }

  loadChartData(): void {
    if (!this.range.value.start || !this.range.value.end) { return; }

    this.regions.forEach(region => {
      this.poService.listar(region, '').subscribe(
        pos => {
          const { elaborados, implantados, comparativo } = this.processPoData(
            pos,
            this.range.value.start!,
            this.range.value.end!
          );
          this.dataByRegion[region] = { elaborados, implantados, comparativo };
        },
        err => {
          console.error(`Erro ao carregar dados do backend para a região ${region}:`, err);
        }
      );
    });
  }

  onDateChange(): void {
    if (this.range.valid) {
      this.loadChartData();
    }
  }

  // Processa lista de POs vinda do backend e gera estruturas para os gráficos
  private processPoData(posList: any[], startDate: Date, endDate: Date) {
    const elaboradosMap: Map<string, number> = new Map();
    const implantadosMap: Map<string, number> = new Map();

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const isBetween = (d: Date) => d >= startDate && d <= endDate;

    const parseDate = (str: string): Date | null => {
      if (!str) return null;
      const parts = str.split('/');
      if (parts.length === 3) {
        const [dia, mes, ano] = parts;
        return new Date(+ano, +mes - 1, +dia);
      }
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    };

    posList.forEach(po => {
      const dataPo = parseDate(po.data_po);
      if (dataPo && isBetween(dataPo)) {
        const key = `${monthNames[dataPo.getMonth()]} ${dataPo.getFullYear().toString().slice(-2)}`;
        elaboradosMap.set(key, (elaboradosMap.get(key) ?? 0) + 1);
      }
      const dataImpl = parseDate(po.data_implantacao);
      if (dataImpl && isBetween(dataImpl)) {
        const key = `${monthNames[dataImpl.getMonth()]} ${dataImpl.getFullYear().toString().slice(-2)}`;
        implantadosMap.set(key, (implantadosMap.get(key) ?? 0) + 1);
      }
    });

    // Garante que ambos mapas tenham as mesmas chaves (meses dentro do período)
    const allKeys = new Set<string>([...elaboradosMap.keys(), ...implantadosMap.keys()]);
    // Ordena pelas datas reais
    const orderedKeys = Array.from(allKeys).sort((a, b) => {
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      const monthIndex = (m: string) => monthNames.indexOf(m);
      const dateA = new Date(+`20${yA}`, monthIndex(mA));
      const dateB = new Date(+`20${yB}`, monthIndex(mB));
      return dateA.getTime() - dateB.getTime();
    });

    const elaborados = orderedKeys.map(name => ({ name, value: elaboradosMap.get(name) ?? 0 }));
    const implantados = orderedKeys.map(name => ({ name, value: implantadosMap.get(name) ?? 0 }));
    const comparativo = [
      { name: 'Elaborados', series: elaborados },
      { name: 'Implantados', series: implantados }
    ];

    return { elaborados, implantados, comparativo };
  }
}
