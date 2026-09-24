# Novo layout da navegação lateral

## Objetivo
Reorganizar a barra lateral existente para tornar as opções mais fáceis de localizar, sem alterar páginas, permissões ou funcionalidades.

## Alterações
- Separar os links de cada perfil em grupos curtos e identificáveis, como Visão geral, Atendimento, Gestão e Conta.
- Manter uma única linguagem visual para todos os ícones, com alinhamento e tamanho consistentes.
- Criar um destaque mais claro para a página ativa, usando contraste, marcador lateral e estado visual persistente.
- Refinar o cabeçalho e a área do usuário da barra, preservando logo, nome, cargo, recolhimento no computador e menu móvel.
- Garantir que os grupos continuem legíveis no modo compacto e no celular.

## Validação
- Conferir a navegação dos quatro perfis.
- Validar página ativa, recolhimento, abertura no celular e ausência de sobreposição.
- Confirmar que nenhuma rota ou regra de acesso foi alterada.

## Detalhes técnicos
- Adicionar a classificação de grupo aos itens de navegação já existentes.
- Renderizar os grupos a partir da configuração de cada perfil, evitando duplicação.
- Ajustar apenas os estilos da barra lateral e seus estados interativos.
