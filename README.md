Clínica Médica - Frontend

> **Projeto Integrador - SENAI**  
> Interface web simples e acessível para recepção e pacientes agendarem consultas.

---

## Objetivo
Oferecer uma tela fácil e acessível (com foco em idosos) para agendamento rápido de consultas e visualização de horários vagos.

## Perfis
- **Paciente:** cadastro, agendamento, cancelamento e remarcação, histórico, notificações, atestados e receitas para imprimir e pagamento simulado (convênio Particular).
- **Recepção:** dashboard, agenda, consultas, pacientes, fila de espera, médicos, horários e bloqueios, registro de consultas realizadas.
- **Profissional de saúde:** agenda do dia, pacientes, prontuário, emissão de atestado, receita e pedido de exame, e horários de atendimento.
- **Administrador:** usuários, médicos, especialidades, agendas, convênios, configurações da clínica e relatório com planilhas.

A busca do topo de cada área procura pacientes, médicos, usuários e especialidades e abre a tela certa já filtrada.

## Tecnologias
React, TanStack Start, TypeScript, Tailwind CSS e componentes Radix UI. Os dados vêm da API [clinica-backend](https://github.com/clinica-consulta/clinica-backend) (Node.js + Express + MongoDB).

## Como rodar
Precisa do Node.js 20 ou mais novo e da API rodando.

```sh
npm install
npm run dev
```

O site abre em http://localhost:8080. Por padrão ele usa a API em `http://localhost:3000/api`. Para usar outra, crie um arquivo `.env` com:

```
VITE_API_URL=https://endereco-da-api/api
```

## Publicação (Vercel)
Importe este repositório na Vercel sem mudar as configurações de build e adicione a variável `VITE_API_URL` com o endereço da API publicada (por exemplo `https://clinica-senai-api.onrender.com/api`).

## Git Flow
- `main`: versão estável
- `develop`: integração
- `feature/...`: uma branch por funcionalidade, com merge no `develop`
