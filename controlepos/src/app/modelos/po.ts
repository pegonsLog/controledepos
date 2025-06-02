export interface Po {
  id?: string; // Adicionar este campo para o ID do documento do Firestore
  numero_po: string; // Alterado de numero_do_po
  data_po: string;
  tipo_logradouro: string;
  logradouro: string;
  complemento: string;
  analista: string;
  data_implantacao: string;
  funcionario_responsavel: string;
  bairro: string;
  observacoes: string;
  detalhamento: string;
  especificacoes: string;
  situacao: string;
  solicitante: string;
  tipo_solicitante: string;
  data_enc_dro: string;
  numero_controle: string;
  data_arquivamento: string;
}
