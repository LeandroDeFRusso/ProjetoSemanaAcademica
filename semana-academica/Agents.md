# AGENTS.md

## Projeto

Sistema web para gerenciamento da Semana Acadêmica.

## Stack

- Linguagem: JavaScript
- Backend: Node.js + Express
- Banco de dados: SQLite
- Frontend: Vue.js
- Interface: Web

## Estrutura do projeto

- `api/`: backend e API HTTP.
- `app/`: interface web.
- `entrevistas/`: registros das entrevistas dos módulos.
- `specs/`: especificações dos módulos.
- `auditorias/`: pareceres dos agentes de auditoria.
- `.opencode/skills/`: skills utilizadas no desenvolvimento.
- `.opencode/agent/`: subagentes utilizados no desenvolvimento.
- `evidencias/`: arquivos utilizados para registrar as evidências do desenvolvimento.

## Regras gerais

- A API deve seguir exatamente o contrato definido em `contrato-api.md`.
- Rotas, métodos HTTP, campos e códigos de retorno definidos no contrato não devem ser alterados.
- Regras de negócio devem ser definidas nas especificações antes da implementação.
- Nenhuma regra de negócio deve ser criada com base em suposições.
- Cada regra implementada deve possuir teste automatizado.
- Os testes devem ser escritos antes da implementação da regra, seguindo o fluxo de TDD definido pelo projeto.
- Não alterar testes existentes apenas para fazê-los passar.
- A API e a interface devem possuir testes automatizados.
- A interface deve utilizar uma versão falsa da API durante seus testes.
- Alterações em `AGENTS.md` devem ser justificadas de acordo com uma necessidade real encontrada durante o desenvolvimento.