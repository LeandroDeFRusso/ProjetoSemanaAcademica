# AGENTS.md

## Contexto

Este diretório contém a API do sistema da Semana Acadêmica.

A API é responsável por disponibilizar os recursos do sistema através de HTTP
e JSON, seguindo o contrato definido em `../contrato-api.md`.

## Stack

- JavaScript
- Node.js
- Express
- SQLite

## Dependência entre Módulos (Stubs)

- **M1 (Grade de Atividades) e M2 (Inscrições):** A regra R7 (`VAGAS_ABAIXO_DOS_INSCRITOS`) valida que as vagas de uma atividade não podem ser reduzidas abaixo da quantidade de inscrições que ocupam vaga (confirmadas + convocadas). Como o módulo M2 (Inscrições) ainda não existe na entrega de M1, a contagem de ocupadas retorna `0` por padrão no código real. Para permitir testes automatizados e validação rigorosa de R7, utiliza-se um mecanismo de stub via importação direta no teste (`setOcupadasStub` / `atividadesService`), permitindo simular a quantidade de inscrições ocupadas sem criar rotas HTTP de teste dedicadas.

## Execução

Instalar as dependências:

```bash
npm install