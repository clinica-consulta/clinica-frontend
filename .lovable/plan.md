# Plano — Gestão de Consultas

## Objetivo
Criar um protótipo front-end responsivo e funcional para a rotina de uma clínica, usando apenas dados fictícios e sem conexão com servidor nesta etapa.

## Experiência principal
- Tela de login com seleção demonstrativa de perfil: paciente, recepcionista, profissional de saúde e administrador.
- Estrutura interna com menu lateral recolhível no computador e navegação adaptada ao celular.
- Dashboard com resumo do dia, próximos atendimentos, confirmações pendentes, taxa de presença e atalhos úteis.
- Áreas navegáveis para Agenda, Consultas, Pacientes, Fila de espera, Check-in, Profissionais, Relatórios e Perfil/configurações.
- Operações simuladas de agendar, cancelar, reagendar, confirmar, chamar paciente da fila e realizar check-in.
- Busca, filtros, formulários e estados vazios simples, suficientes para demonstrar os fluxos essenciais.

## Identidade visual
- Aplicar exatamente a família de cores da referência: azul-marinho, azul acinzentado, azul-claro, creme e cinzas claros.
- Usar a logo enviada na autenticação, menu e tela de carregamento.
- Títulos em Anton e textos em Poppins.
- Interface clínica, limpa e profissional, com bom contraste, foco visível e alvos de toque adequados.
- Tela de carregamento breve nas trocas de página, com animação elegante ao redor da logo e respeito à preferência de movimento reduzido.
- Notificações personalizadas nas cores da marca para sucesso, aviso, informação e erro.

## Estrutura técnica
- Manter React com TanStack Router e criar uma rota real para cada tela.
- Centralizar a moldura do sistema, navegação, cabeçalho e loading em componentes compartilhados.
- Manter os dados fictícios e tipos em módulos separados para facilitar a futura troca por Node.js, Express e MongoDB.
- Armazenar apenas a sessão demonstrativa no navegador; nenhum dado clínico real será persistido.
- Hospedar a logo enviada como ativo do projeto e reutilizá-la sem duplicação.
- Adicionar metadados próprios em todas as páginas.

## Validação
- Conferir login e navegação completa em computador e celular.
- Validar os principais botões e notificações, ausência de sobreposição e legibilidade das tabelas/listas.
- Confirmar que a tela de carregamento aparece nas transições e que a aplicação não apresenta erros no navegador.
