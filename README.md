# Clinic Harmony

Crie a interface base de uma plataforma web responsiva chamada Gestão de Consultas, utilizando React.

O sistema deve ajudar uma clínica a reduzir faltas, organizar consultas e diminuir o trabalho manual da recepção.

Perfis:

Paciente

Recepcionista

Profissional de Saúde

Administrador

Principais funcionalidades:

Login

Dashboard

Cadastro de pacientes

Agendamento, cancelamento e reagendamento

Agenda dos profissionais

Confirmação e lembretes de consultas

Fila de espera para preencher horários cancelados

Check-in digital

Formulário de pré-atendimento

Notificações

Gestão de profissionais

Relatórios simples de consultas e faltas

Principais telas:

Login

Dashboard

Agenda

Consultas

Pacientes

Fila de espera

Check-in

Profissionais

Relatórios

Perfil/configurações

O sistema deve ter uma interface moderna, simples, acessível e responsiva para computador e celular.

Neste momento, faça somente o front-end com dados fictícios, deixando a estrutura preparada para futuramente conectar com Node.js + Express + MongoDB.

Não crie funcionalidades desnecessárias. O objetivo é ter uma plataforma simples, funcional e suficiente para solucionar a demanda proposta.

ja utilize a paleta de cores da imagem ja adicione a logo, tambem coloque fonte poppins para texto, ANTON para titulo e tambem adicione a tela de loading que ira ter no nosso site na movimentação entre as paginas. e na loading coloque a nossa logo com algo assim bem bacana e tambem coloque os toast de de notificações no site persolizado com as cores chat bem profissional e bonito ao mesmo tempo

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba5d8df7-6af7-4749-92d2-b253bd4e53c5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Rodando com o back-end (API)

Os dados (login, pacientes, consultas, agenda, avisos) vêm da API [clinica-backend](https://github.com/clinica-consulta/clinica-backend) com MongoDB.

1. Suba a API seguindo o README do back-end (`npm install`, `.env`, `npm run seed`, `npm run dev`). Ela fica em `http://localhost:3000`.
2. Neste projeto, rode `npm install` e `npm run dev`. O site abre em `http://localhost:8080`.
3. Se a API estiver em outro endereço, crie um `.env` a partir do `.env.example` e ajuste `VITE_API_URL`.

Logins de demonstração (senha `123456`): `recepcao@demo.com`, `paciente@demo.com`, `profissional@demo.com`, `admin@demo.com`.
