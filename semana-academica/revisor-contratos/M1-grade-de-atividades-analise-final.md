## Relatório de Revisão de Contrato

| Categoria | Contrato (`contrato-api.md`) | Implementação Encontrada (`api/` ou `app/`) | Local (`arquivo:linha`) | Veredito |
|---|---|---|---|---|
| Rota / Método | `POST /atividades` | `POST /atividades` | `api/src/server.js:261` | CONFORME |
| Campo de Saída | `emEspera` | Retorna `emEspera: 0` (stub) | `api/src/server.js:223` | DIVERGENTE |
| Código de Erro | `404` para sala inexistente | Retorna `404` com `NAO_ENCONTRADO` | `api/src/server.js:320` | CONFORME |

## Achados de Divergência

1. **[Divergência de Campo]** O campo `emEspera` na resposta da rota `POST /atividades` (e `GET /atividades/:id`) está sendo retornado como `0` fixo. O contrato define este campo como calculado. Conforme observado em `revisor-contratos/M1-grade-de-atividades-observacoes.md`, esta é uma limitação temporária devido à dependência do módulo M2 (Inscrições) que ainda não foi implementado.

## Veredito Geral

A implementação encontra-se em conformidade com o contrato, com a ressalva documentada de que o campo `emEspera` está utilizando um valor fixo (stub) até que o módulo M2 seja integrado. A correção para retornar `404` quando a sala não existe foi verificada e está correta.
