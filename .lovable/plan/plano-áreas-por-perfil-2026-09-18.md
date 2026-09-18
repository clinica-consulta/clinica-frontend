# Plano — Áreas por perfil

## Objetivo
Criar experiências próprias para Paciente, Profissional de Saúde e Administrador, mantendo intactas as telas existentes da Recepção e reutilizando exatamente a mesma identidade visual, estrutura e componentes.

## Acesso demonstrativo
- Manter o Login visualmente como está, sem seletor de perfil.
- Identificar o perfil pelo e-mail fictício informado e direcionar para a área correspondente.
- Usar quatro contas demonstrativas: recepção, paciente, profissional e administrador; qualquer senha preenchida será aceita neste protótipo front-end.
- Manter o Cadastro como cadastro de paciente.

## Estrutura compartilhada
- Tornar menu, cabeçalho, busca e identificação do usuário configuráveis por perfil, sem duplicar o `AppShell`.
- Reutilizar os componentes atuais de cabeçalho, cards, seções, badges, botões, formulários, loading e notificações.
- Preservar todas as rotas e telas existentes da Recepção sem alterar seus conteúdos ou funcionamento.
- Manter os dados fictícios centralizados e adicionar somente os dados necessários aos novos perfis.

## Área do Paciente
- Início com próxima consulta, lembretes e atalhos.
- Minhas consultas: acompanhar, cancelar ou reagendar.
- Agendar consulta por especialidade, profissional, data e horário.
- Check-in digital e formulário de pré-atendimento.
- Notificações e perfil pessoal.

## Área do Profissional de Saúde
- Início com resumo da agenda e pacientes aguardando.
- Minha agenda e atendimentos do dia.
- Lista dos pacientes vinculados às consultas.
- Disponibilidade de horários.
- Notificações e perfil profissional.

## Área do Administrador
- Início com indicadores gerais da clínica.
- Gestão de profissionais e usuários.
- Relatórios de consultas, faltas e ocupação.
- Configurações gerais e perfil administrativo.
- Acesso às áreas operacionais necessárias à supervisão, sem alterar a experiência da Recepção.

## Ajustes pontuais no acesso
- Remover qualquer mudança indesejada de cor ao passar o mouse no Login e no Cadastro.
- Manter dimensões e arredondamentos do Login exatamente como estão.
- Reduzir discretamente apenas os arredondamentos dos elementos do Cadastro.

## Responsividade e validação
- Criar rotas reais e metadados próprios para cada página nova.
- Validar os quatro e-mails demonstrativos, menus e navegação em computador e celular.
- Confirmar que não há vazamento de páginas entre perfis, sobreposição visual, links quebrados ou erros no navegador.
