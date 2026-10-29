# 🌴 Sistema de Pedido e Gerenciamento de Férias de Funcionários

Sistema web completo de **Pedido e Gerenciamento de Férias de Funcionários** desenvolvido como projeto acadêmico para a disciplina de **Elicitação de Requisitos**.

O sistema opera de ponta a ponta com persistência em tempo real no **Firebase Firestore**, autenticação com controle de acesso baseado em papéis (**RBAC**) no **Firebase Authentication**, e um backend em **Node.js com Express** responsável pelas validações de regras trabalhistas da **CLT** (Consolidação das Leis do Trabalho).

---

## 📋 Sumário
1. [Visão Geral e Propósito Acadêmico](#-visão-geral-e-propósito-acadêmico)
2. [Atores e Perfis do Sistema](#-atores-e-perfis-do-sistema)
3. [Regras de Negócio Implementadas (CLT)](#-regras-de-negócio-implementadas-clt)
4. [Telas do Sistema (10 Visões)](#-telas-do-sistema-10-visões)
5. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
6. [Estrutura de Pastas do Projeto](#-estrutura-de-pastas-do-projeto)
7. [Como Instalar e Executar](#-como-instalar-e-executar)
8. [Configuração do Firebase Console](#-configuração-do-firebase-console)
9. [Roteiro de Demonstração para Apresentação em Sala](#-roteiro-de-demonstração-para-apresentação-em-sala)

---

## 🎯 Visão Geral e Propósito Acadêmico

Este projeto foi concebido para materializar os conceitos de **Engenharia de Requisitos**:
- **Elicitação e Mapeamento de Atores**: Identificação de responsabilidades distintas e segregação de funções.
- **Validação de Regras de Negócio Restritivas**: Aplicação rigorosa da legislação trabalhista brasileira (Art. 134 e 143 da CLT) impedindo violações sistêmicas.
- **Rastreabilidade e Auditoria**: Registro de logs de todos os eventos com carimbo de tempo (*timestamp*), ator responsável e protocolo oficial emitido pelo RH.

---

## 👥 Atores e Perfis do Sistema

### 1. 🧑‍💻 Funcionário (Colaborador)
- **Consultar Saldo de Férias**: Visualiza dias totais adquiridos (padrão 30 dias), dias já usufruídos, dias vendidos e saldo restante disponível.
- **Criar Pedidos de Férias**: Informa data de início e quantidade de dias (com cálculo automático da data de término).
- **Opção de Vender 1/3 (Abono Pecuniário)**: Pode converter 10 dias de férias em remuneração financeira.
- **Acompanhar Status dos Pedidos**: Visualiza em tempo real as etapas do workflow (*Pendente*, *Aprovado*, *Recusado*, *Registrado pelo RH*, *Cancelado*).
- **Consultar Motivo da Recusa**: Modal dedicado que exibe com transparência a justificativa por escrito redigida pelo gestor.
- **Cancelar Pedidos**: Permite desistir de pedidos que ainda não foram avaliados pelo gestor.

### 2. 👔 Gerente (Gestor de Equipe)
- **Painel da Equipe**: Visualiza métricas de pendências e colaboradores atualmente em férias.
- **Análise de Pedidos**: Aprova ou recusa solicitações dos seus liderados diretos.
- **Justificativa Obrigatória em Recusa (RN05)**: O sistema trava o formulário caso o gestor tente recusar sem fundamentar o motivo por escrito.
- **Detector Automático de Conflitos**: Identifica sobreposições de datas entre membros do mesmo departamento para evitar desfalques operacionais.

### 3. 🏢 Recursos Humanos (RH / DP)
- **Fila de Férias Aprovadas**: Acessa pedidos que já receberam a chancela do gestor imediato.
- **Registro Formal em Folha**: Homologa o pedido no sistema, debitando o saldo do funcionário e emitindo o protocolo oficial (ex: `FER-2026-XXXX`).
- **Administração de Saldos**: Cadastra e administra os períodos aquisitivos dos colaboradores, garantindo integridade dos saldos reais.
- **Histórico e Auditoria Geral**: Consulta a trilha de auditoria completa de todas as operações corporativas.

---

## ⚖️ Regras de Negócio Implementadas (CLT)

| Código | Regra | Fundamentação Legal | Mecanismo de Aplicação no Sistema |
|---|---|---|---|
| **RN01** | **Fracionamento em até 3 períodos** | Art. 134, § 1º CLT | Impede a submissão de um 4º pedido dentro do mesmo ciclo aquisitivo. |
| **RN02** | **Período obrigatório de &ge; 14 dias** | Art. 134, § 1º CLT | Bloqueia pedidos fracionados se não restar saldo suficiente para cumprir o período de 14 dias. |
| **RN03** | **Piso mínimo de 5 dias por período** | Art. 134, § 1º CLT | Validação síncrona que rejeita durações de 1 a 4 dias corridos. |
| **RN04** | **Abono Pecuniário (Venda de 1/3)** | Art. 143 CLT | Converte 10 dias em dinheiro, debitando 10 dias adicionais do saldo e bloqueando nova venda no mesmo ciclo. |
| **RN05** | **Justificativa obrigatória em recusa** | Requisito de Transparência | Modal bloqueante com campo textual obrigatório gravado no Firestore. |
| **RN06** | **Segregação de Funções** | Governança Corporativa | O botão de homologar no RH só fica habilitado para pedidos com status `approved`. |

---

## 🖥️ Telas do Sistema (10 Visões)

1. **Login e Cadastro**: Alternador rápido de personas acadêmicas (Ana Silva, Carlos Mendes, Mariana Costa), cadastro manual e login com Google (Firebase Auth).
2. **Painel do Funcionário**: Cartões de saldo, indicador de cumprimento dos 14 dias, contagem para as próximas férias e atalhos rápidos.
3. **Formulário para Solicitar Férias**: Preenchimento automático de dados, seleção de datas, toggle de abono 1/3, checklist dinâmico de conformidade CLT e modal de confirmação.
4. **Histórico e Acompanhamento**: Filtros por status, botão de cancelamento de pendentes e modal de motivo de recusa.
5. **Painel do Gerente**: Indicadores da equipe, alertas urgentes e membros em férias hoje.
6. **Tela de Análise de Pedidos**: Cards com análise de impacto, verificação de sobreposição e botões de decisão.
7. **Calendário de Férias da Equipe**: Calendário mensal interativo com alertas visuais de múltiplos colaboradores ausentes na mesma data.
8. **Painel do RH**: Visão corporativa, totalizador de homologações e fila de efetivação.
9. **Tela de Registro de Férias**: Homologação formal com emissão de protocolo rastreável.
10. **Página de Perfil e Configurações**: Detalhes cadastrais, extrato do período aquisitivo e aba da **Matriz de Elicitação de Requisitos**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js com Express (APIs de cálculo de regras CLT em `/api/vacations/validate` e `/api/vacations/rules`).
- **Banco de Dados**: Firebase Cloud Firestore com listeners em tempo real (`onSnapshot`).
- **Segurança**: Regras de segurança Firestore (`firestore.rules`) com modelo de negação padrão (*Default Deny*) e validação de papéis (*ABAC*).
- **Autenticação**: Firebase Authentication com provedor Google e suporte a personas acadêmicas.

---

## 📁 Estrutura de Pastas do Projeto

```text
├── server.ts                             # Servidor Express Node.js
├── server/
│   ├── controllers/
│   │   └── vacationController.ts        # Controlador dos endpoints da API
│   ├── routes/
│   │   └── vacationRoutes.ts            # Rotas Express (/api/vacations)
│   └── services/
│       └── vacationCalculationService.ts # Motor de validação de regras CLT
├── src/
│   ├── config/
│   │   └── firebase.ts                  # Inicialização do Firebase e handler de erros
│   ├── context/
│   │   └── AuthContext.tsx              # Contexto de autenticação e troca de perfis
│   ├── types/
│   │   └── vacation.ts                  # Modelos de dados e interfaces TypeScript
│   ├── services/
│   │   ├── firebaseService.ts           # Acesso ao Firestore e persistência
│   │   └── vacationValidator.ts         # Validador de regras de negócio frontend
│   ├── components/
│   │   ├── Navbar.tsx                   # Cabeçalho com seletor de perfil acadêmico
│   │   ├── Sidebar.tsx                  # Menu lateral responsivo baseado em papéis
│   │   ├── StatusBadge.tsx              # Badges coloridos por status
│   │   ├── ConfirmationModal.tsx        # Modal de resumo prévio do pedido
│   │   ├── RejectionModal.tsx           # Modal com justificativa obrigatória
│   │   ├── ViewRejectionReasonModal.tsx # Leitura do parecer pelo colaborador
│   │   └── AdjustBalanceModal.tsx       # Gestão de saldos pelo RH
│   ├── pages/
│   │   ├── LoginView.tsx                # Tela 1: Login e cadastro
│   │   ├── EmployeeDashboard.tsx        # Tela 2: Painel do funcionário
│   │   ├── RequestVacationView.tsx       # Tela 3: Formulário de solicitação
│   │   ├── EmployeeHistoryView.tsx      # Tela 4: Histórico e acompanhamento
│   │   ├── ManagerDashboard.tsx         # Tela 5: Painel do gerente
│   │   ├── ManagerReviewView.tsx        # Tela 6: Tela de análise de pedidos
│   │   ├── TeamCalendarView.tsx         # Tela 7: Calendário de férias da equipe
│   │   ├── HrDashboard.tsx              # Tela 8: Painel do RH
│   │   ├── HrRegistrationView.tsx       # Tela 9: Tela de registro das férias
│   │   ├── ProfileAndSettingsView.tsx   # Tela 10: Perfil e configurações
│   │   ├── HrEmployeesView.tsx          # Gestão detalhada de colaboradores (RH)
│   │   ├── HrAuditView.tsx              # Histórico e logs de auditoria
│   │   ├── ManagerTeamHistoryView.tsx   # Histórico do time para o gestor
│   │   └── AcademicRequirementsView.tsx # Matriz de Elicitação de Requisitos
│   ├── App.tsx                          # Componente raiz e roteamento de abas
│   ├── main.tsx                         # Ponto de entrada React
│   └── index.css                        # Estilos globais Tailwind
├── firebase-blueprint.json              # Representação intermediária do Firestore
├── firestore.rules                      # Regras de segurança declarativas do Firestore
├── package.json                         # Dependências e scripts
└── README.md                            # Documentação completa
```

---

## 🛠️ Como Instalar e Executar

### Pré-requisitos
- Node.js versão 18 ou superior instalado.
- Gerenciador de pacotes `npm`.

### Passo a passo
1. Clone ou extraia o repositório no seu computador:
```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra o navegador no endereço indicado:
```text
http://localhost:3000
```

---

## 🔒 Configuração do Firebase Console

O projeto já vem provisionado com um projeto Firebase ativo. Caso deseje apontar para um projeto Firebase pessoal:

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um novo projeto Firebase.
3. No menu **Build > Authentication**:
   - Ative o método de login **Google**.
4. No menu **Build > Firestore Database**:
   - Crie um banco de dados em modo de produção.
   - Copie o conteúdo do arquivo `firestore.rules` deste repositório e cole na aba **Regras** (*Rules*) do Firestore, clicando em **Publicar**.
5. Em **Configurações do Projeto > Geral > Seus Aplicativos**:
   - Adicione um aplicativo Web e copie as chaves fornecidas para o arquivo `firebase-applet-config.json`.

---

## 🎓 Roteiro de Demonstração para Apresentação em Sala

Para apresentar na aula de **Elicitação de Requisitos**, siga este fluxo de 5 minutos:

1. **Passo 1 (Funcionária - Ana Silva)**:
   - Abra o sistema e selecione **Ana Silva (Funcionária)** no alternador superior.
   - Veja o saldo inicial de 30 dias.
   - Acesse **Solicitar Férias**. Tente digitar 3 dias: veja o sistema avisar que o piso mínimo CLT é 5 dias (**RN03**).
   - Peça 15 dias corridos e ative a opção **Vender 1/3 das férias (Abono)**.
   - Veja o resumo prévio no modal e confirme a solicitação.
2. **Passo 2 (Gerente - Carlos Mendes)**:
   - No topo, troque o perfil para **Carlos Mendes (Gerente)**.
   - Veja o alerta de pedido pendente da Ana Silva.
   - Acesse **Análise de Pedidos**. Observe o detector de conflitos de equipe.
   - Clique em **Aprovar**. O pedido avança para a próxima etapa do fluxo.
3. **Passo 3 (RH - Mariana Costa)**:
   - Alterne para **Mariana Costa (RH)**.
   - Veja o pedido de Ana Silva na fila de **Férias Aprovadas Aguardando Registro em Folha**.
   - Clique em **Homologar e Registrar no Sistema**.
   - O sistema gera automaticamente o protocolo oficial (ex: `FER-2026-XXXX`) e atualiza o saldo da Ana Silva no Firestore para 5 dias restantes (30 - 15 descanso - 10 abono = 5).
4. **Passo 4 (Confirmação da Funcionária)**:
   - Volte para o perfil de Ana Silva.
   - Acesse **Meus Pedidos**: o status agora é **Registrado pelo RH** com o número do protocolo exibido.
5. **Passo 5 (Cenário de Recusa com Justificativa)**:
   - Faça um novo pedido como funcionária.
   - Volte ao gerente Carlos Mendes e clique em **Recusar**.
   - Tente submeter sem texto: o sistema bloqueia. Preencha uma justificativa real (ex: *"Período de entrega do projeto"*).
   - Volte para Ana Silva e clique em **Ver Justificativa**: o motivo digitado pelo gestor é exibido com transparência.
6. **Passo 6 (Matriz de Requisitos)**:
   - Clique na aba **Elicitação de Requisitos** no menu lateral e mostre a rastreabilidade de todos os Requisitos Funcionais e Regras de Negócio exigidos pelo professor.
