## Matriz de rastreabilidade

| Regra | Origem | Teste que comprova | Veredito |
|---|---|---|---|
| R1 | P1 | api/verificacoes/m1-fatia2.spec.js: «POST /atividades com minicurso contendo 1 encontro retorna 422 QUANTIDADE_DE_ENCONTROS» | COMPROVADA |
| R2 | P2 | api/verificacoes/m1-fatia2.spec.js: «POST /atividades com encontro de 30 minutos retorna 422 ENCONTRO_INVALIDO» | COMPROVADA |
| R3 | P6 | api/verificacoes/m1-fatia2.spec.js: «POST /atividades com vagas acima da capacidade da sala retorna 422 VAGAS_ACIMA_DA_CAPACIDADE» | COMPROVADA |
| R4 | P3 | api/verificacoes/m1-fatia2.spec.js: «POST /atividades com conflito de sala (menos de 15 min de intervalo) retorna 409 CONFLITO_DE_SALA» | COMPROVADA |
| R5 | P8 | api/verificacoes/m1-fatia2.spec.js: «POST /atividades com sucesso calcula cargaHorariaMinutos corretamente e ignora valor enviado (R5)» | COMPROVADA |
| R6 | P4 | api/verificacoes/m1-fatia3.spec.js: «PATCH /atividades/:id alterando salaId, tipo ou encontros retorna 422 CAMPO_NAO_EDITAVEL» | COMPROVADA |
| R7 | P7 | api/verificacoes/m1-fatia3.spec.js: «R7: PATCH /atividades/:id reduzindo vagas abaixo das inscrições ocupadas retorna 409 VAGAS_ABAIXO_DOS_INSCRITOS [via stub M2]» | COMPROVADA |
| R8 | P5 | api/verificacoes/m1-fatia4.spec.js: «POST /atividades/:id/cancelamento em atividade que já iniciou E já está cancelada retorna 422 ATIVIDADE_CANCELADA (prova a ordem)» | COMPROVADA |
| R10 | P9 | api/verificacoes/m1-fatia1.spec.js: «GET /atividades filtra por dia e tipo, ordena por R10 e calcula situacao por R12» | COMPROVADA |
| R11 | — | api/verificacoes/m1-fatia2.spec.js: «POST /atividades por participante retorna 403 SOMENTE_ORGANIZACAO» | COMPROVADA |
| R12 | P10 | api/verificacoes/m1-fatia1.spec.js: «GET /atividades filtra por dia e tipo, ordena por R10 e calcula situacao por R12» | COMPROVADA |

## Suíte

`npm test` (no diretório `api`) → `ℹ pass 33`

## Achados

Nenhum achado. Todas as regras foram conferidas e possuem testes que as comprovam.

## Veredito

O módulo M1 pode ser aceito. Todas as regras foram conferidas e possuem testes automatizados que as comprovam.
