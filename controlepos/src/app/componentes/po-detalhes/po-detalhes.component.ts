import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Po } from '../../modelos/po'; 
import { NgIf, DatePipe } from '@angular/common'; 
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 

// Dados Mock (idealmente viriam de um serviço)
const MOCK_POS: Po[] = [
  { numero_do_po: 'PO-001', data_po: '2024-01-15', analista: 'João Silva', situacao: 'Concluído', solicitante: 'Empresa A', bairro: 'Centro', tipo_de_logradouro: 'Rua', logradouro: 'Principal', complemento: 'Sala 101', detalhamento: 'Detalhes da PO-001: Projeto de desenvolvimento de software.', data_implantacao: '2024-01-20', funcionario_responsavel: 'Ana P.', observacoes: 'Entregue com sucesso', especificacoes: 'Completo', e_mail: 'joao@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-02-10', link_do_po: 'http://link.com/po001', numero_de_controle: 'CTRL001', data_arquivamento: '2024-02-15', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-002', data_po: '2024-02-20', analista: 'Maria Oliveira', situacao: 'Em Andamento', solicitante: 'Empresa B', bairro: 'Vila Nova', tipo_de_logradouro: 'Avenida', logradouro: 'Secundária', complemento: 'Andar 5', detalhamento: 'PO-002: Implementação de sistema de gestão.', data_implantacao: '2024-02-25', funcionario_responsavel: 'Carlos R.', observacoes: 'Em desenvolvimento', especificacoes: 'Parcial', e_mail: 'maria@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: '2024-03-15', link_do_po: 'http://link.com/po002', numero_de_controle: 'CTRL002', data_arquivamento: '2024-03-20', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-003', data_po: '2023-12-10', analista: 'Pedro Costa', situacao: 'Pendente', solicitante: 'Empresa C', bairro: 'Jardins', tipo_de_logradouro: 'Praça', logradouro: 'Circular', complemento: 'Loja 3', detalhamento: 'PO-003: Aguardando aprovação do cliente.', data_implantacao: '2023-12-15', funcionario_responsavel: 'Sofia L.', observacoes: '', especificacoes: 'Básico', e_mail: 'pedro@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: '2024-01-05', link_do_po: 'http://link.com/po003', numero_de_controle: 'CTRL003', data_arquivamento: '2024-01-10', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-004', data_po: '2024-03-01', analista: 'Ana Beatriz', situacao: 'Em Andamento', solicitante: 'Empresa D', bairro: 'Lapa', tipo_de_logradouro: 'Rua', logradouro: 'das Palmeiras', complemento: 'Apto 22', detalhamento: 'Detalhamento para PO-004, verificar documentação pendente.', data_implantacao: '2024-03-05', funcionario_responsavel: 'Marcos G.', observacoes: 'Verificar documentação', especificacoes: 'Premium', e_mail: 'ana.b@empresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-04-10', link_do_po: 'http://link.com/po004', numero_de_controle: 'CTRL004', data_arquivamento: '2024-04-15', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-005', data_po: '2024-03-10', analista: 'Lucas Mendes', situacao: 'Concluído', solicitante: 'Empresa E', bairro: 'Barra Funda', tipo_de_logradouro: 'Avenida', logradouro: 'Industrial', complemento: 'Galpão 5', detalhamento: 'PO-005: Projeto finalizado e entregue com sucesso.', data_implantacao: '2024-03-15', funcionario_responsavel: 'Julia P.', observacoes: 'Tudo OK', especificacoes: 'Padrão', e_mail: 'lucas.m@empresa.com', tipo_de_solicitante: 'Interno', data_enc_dro: '2024-04-20', link_do_po: 'http://link.com/po005', numero_de_controle: 'CTRL005', data_arquivamento: '2024-04-25', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-006', data_po: '2024-04-05', analista: 'Fernanda Lima', situacao: 'Pendente', solicitante: 'Cliente X', bairro: 'Moema', tipo_de_logradouro: 'Alameda', logradouro: 'dos Pássaros', complemento: 'Casa 10', detalhamento: 'PO-006: Aguardando pagamento.', data_implantacao: '2024-04-10', funcionario_responsavel: 'Ricardo S.', observacoes: 'Aguardando pagamento', especificacoes: 'Customizado', e_mail: 'fernanda.l@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-05-12', link_do_po: 'http://link.com/po006', numero_de_controle: 'CTRL006', data_arquivamento: '2024-05-18', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-007', data_po: '2024-04-15', analista: 'Gabriel Alves', situacao: 'Cancelado', solicitante: 'Empresa F', bairro: 'Pinheiros', tipo_de_logradouro: 'Travessa', logradouro: 'Curta', complemento: '', detalhamento: 'PO-007: Cancelado devido à desistência do cliente.', data_implantacao: '2024-04-20', funcionario_responsavel: 'Beatriz M.', observacoes: 'Cliente desistiu', especificacoes: 'Básico', e_mail: 'gabriel.a@empresa.com', tipo_de_solicitante: 'Parceiro', data_enc_dro: '2024-05-22', link_do_po: 'http://link.com/po007', numero_de_controle: 'CTRL007', data_arquivamento: '2024-05-28', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-008', data_po: '2024-05-02', analista: 'Mariana Costa', situacao: 'Em Andamento', solicitante: 'Governo Estadual', bairro: 'Centro Cívico', tipo_de_logradouro: 'Praça', logradouro: 'da República', complemento: 'Edifício Governamental, Sala 301', detalhamento: 'Detalhamento do PO-008, projeto de alta prioridade.', data_implantacao: '2024-05-08', funcionario_responsavel: 'Tiago N.', observacoes: 'Prioridade alta', especificacoes: 'Premium', e_mail: 'mariana.c@gov.br', tipo_de_solicitante: 'Governo', data_enc_dro: '2024-06-15', link_do_po: 'http://link.com/po008', numero_de_controle: 'CTRL008', data_arquivamento: '2024-06-20', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-009', data_po: '2024-05-12', analista: 'Rafael Souza', situacao: 'Aguardando Aprovação', solicitante: 'Cliente Y', bairro: 'Itaim Bibi', tipo_de_logradouro: 'Rua', logradouro: 'Comercial', complemento: 'Conjunto 45', detalhamento: 'PO-009: Aguardando documentação complementar do cliente.', data_implantacao: '2024-05-18', funcionario_responsavel: 'Larissa F.', observacoes: 'Aguardando documentação do cliente', especificacoes: 'Padrão', e_mail: 'rafael.s@cliente.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-06-25', link_do_po: 'http://link.com/po009', numero_de_controle: 'CTRL009', data_arquivamento: '2024-06-30', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() },
  { numero_do_po: 'PO-010', data_po: '2024-06-01', analista: 'Camila Santos', situacao: 'Planejado', solicitante: 'Nova Empresa', bairro: 'Alphaville', tipo_de_logradouro: 'Avenida', logradouro: 'Principal Norte', complemento: 'Torre Beta, cj 1500', detalhamento: 'PO-010: Início do planejamento para novo cliente.', data_implantacao: '2024-06-10', funcionario_responsavel: 'Bruno V.', observacoes: 'Fase inicial', especificacoes: 'Completo', e_mail: 'camila.s@novaempresa.com', tipo_de_solicitante: 'Cliente', data_enc_dro: '2024-07-05', link_do_po: 'http://link.com/po010', numero_de_controle: 'CTRL010', data_arquivamento: '2024-07-10', criado_em: new Date().toISOString(), ultima_edicao: new Date().toISOString() }
];

@Component({
  selector: 'app-po-detalhes',
  standalone: true, 
  imports: [
    NgIf, 
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule 
  ],
  templateUrl: './po-detalhes.component.html',
  styleUrls: ['./po-detalhes.component.scss']
})
export class PoDetalhesComponent implements OnInit {
  po: Po | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const numeroPo = this.route.snapshot.paramMap.get('numero_do_po');
    if (numeroPo) {
      this.po = MOCK_POS.find(p => p.numero_do_po === numeroPo);
    }
    // Em uma aplicação real, você faria uma chamada a um serviço aqui
    // Ex: this.poService.getPoByNumero(numeroPo).subscribe(po => this.po = po);
  }

  voltarParaLista(): void {
    this.router.navigate(['/lista-pos']);
  }
}
