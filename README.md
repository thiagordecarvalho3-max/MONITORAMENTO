# Sistema de Emissão de Ordens de Serviço

Sistema offline para emissão de Ordens de Serviço com funcionalidades de manutenção.

## Recursos

- **Interface Responsiva**: Funciona em desktop, tablet e mobile
- **Funcionamento Offline**: Após o primeiro carregamento, funciona sem internet
- **Geração de PDF**: PDFs profissionais com layout moderno
- **Armazenamento Local**: Dados salvos no navegador
- **Pré-cadastro**: Salve empresas para uso rápido
- **Backup/Restore**: Exporte e importe seus dados

## Como Usar

1. Abra o arquivo `index.html` no navegador
2. Preencha os dados da OS
3. Use a aba "Empresas" para cadastrar contratantes e contratadas
4. Visualize a OS na aba "Preview"
5. Gere o PDF clicando em "Gerar PDF"

## Tipos de Manutenção

- Manutenção Diária
- Manutenção Semanal
- Manutenção Mensal
- Manutenção Trimestral
- Manutenção Anual

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- jsPDF para geração de PDFs
- LocalStorage para persistência
- FontAwesome para ícones

## Estrutura de Arquivos

```
├── index.html           # Página principal
├── styles/
│   ├── main.css        # Estilos principais
│   └── pdf.css         # Estilos do PDF
├── js/
│   ├── main.js         # Lógica principal
│   ├── pdf-generator.js # Geração de PDF
│   └── storage.js      # Gerenciamento de dados
└── assets/             # Recursos visuais
    ├── icons/
    └── images/
```

## Funcionalidades

### Formulário de OS
- Preenchimento automático de data/hora
- Validação de CPF e CNPJ
- Formatação automática de campos
- Auto-salvamento durante digitação

### Gerenciamento de Empresas
- Cadastro de contratantes e contratadas
- Edição e exclusão de empresas
- Seleção rápida no formulário
- Validação de dados

### Preview e PDF
- Visualização antes da geração
- Layout profissional
- Numeração automática de OS
- Campos de assinatura

### Backup e Segurança
- Exportação de dados em JSON
- Importação de backups
- Limpeza de dados
- Armazenamento local seguro

## Uso Offline

O sistema funciona completamente offline após o primeiro carregamento. Os únicos recursos externos são:
- FontAwesome (ícones)
- jsPDF (geração de PDF)

Estes podem ser baixados e hospedados localmente se necessário.