# Relatório de Auditoria: M1 - Grade de Atividades

## Matriz de Rastreabilidade

| Regra | Origem | Teste que comprova | Veredito |
|---|---|---|---|
| R1 | P1 | `api/verificacoes/m1-fatia2.spec.js:37` & `69` | COMPROVADA |
| R2 | P2 | `api/verificacoes/m1-fatia2.spec.js:102` & `134` | COMPROVADA PARCIALMENTE (sem prova para >4h, meia-noite e sobreposição interna) |
| R3 | P6 | `api/verificacoes/m1-fatia2.spec.js:166` | COMPROVADA PARCIALMENTE (sem prova para vagas <= 0 e validação em `PATCH`) |
| R4 | P3 | `api/verificacoes/m1-fatia2.spec.js:198` | COMPROVADA PARCIALMENTE (sem prova para exclusão de atividades canceladas no conflito) |
| R5 | P8 | `api/verificacoes/m1-fatia2.spec.js:246` | COMPROVADA |
| R6 | P4 | `api/verificacoes/m1-fatia3.spec.js:43`, `81` e `api/verificacoes/m1-atualizacoes.spec.js:5` | COMPROVADA PARCIALMENTE (sem prova para alteração isolada de `tipo` ou `encontros`) |
| R7 | P7 | — | SEM PROVA |
| R8 | P5 | `api/verificacoes/m1-fatia4.spec.js:39`, `73`, `113`, `147` e `api/verificacoes/m1-atualizacoes.spec.js:42`, `82`, `115` | COMPROVADA |
| R10 | P9 | `api/verificacoes/m1-fatia1.spec.js:28` | COMPROVADA PARCIALMENTE (sem prova para permanência de atividades canceladas na listagem) |
| R11 | Contrato, RN-101 | `api/verificacoes/m1-fatia2.spec.js:5`, `api/verificacoes/m1-fatia3.spec.js:5`, `api/verificacoes/m1-fatia4.spec.js:5` | SEM ORIGEM (cita contrato/RN em vez de pergunta P-xx) |
| R12 | P10 | `api/verificacoes/m1-fatia1.spec.js:28` e `api/verificacoes/m1-atualizacoes.spec.js:155` | COMPROVADA |

## Suíte de Testes

23 testes executados com sucesso (`pass: 23`, `fail: 0`).

## Achados

1. **[SEM ORIGEM] R11** — a spec em `specs/M1-grade-de-atividades.md:58` aponta `Contrato, RN-101` como origem, o qual não corresponde a nenhuma pergunta P-xx listada na tabela da entrevista em `entrevistas/M1-grade-de-atividades.md`.
2. **[SEM PROVA] R7** — a regra descrita em `specs/M1-grade-de-atividades.md:55` exige recusa com `409 VAGAS_ABAIXO_DOS_INSCRITOS` ao reduzir vagas abaixo da quantidade de inscrições, mas nenhum teste automatizado em `api/verificacoes/` executa ou valida este cenário.
3. **[SEM PROVA] R2, R3, R4, R6, R10** — cobertura parcial de subcenários especificados:
   - R2 (`specs/M1-grade-de-atividades.md:50`): cenários de encontros com duração superior a 4 horas, cruzamento de meia-noite e sobreposição interna na mesma atividade não possuem testes em `api/verificacoes/m1-fatia2.spec.js`.
   - R3 (`specs/M1-grade-de-atividades.md:51`): tentativa de definir vagas `<= 0` ou validação via `PATCH` não possuem testes em `api/verificacoes/`.
   - R4 (`specs/M1-grade-de-atividades.md:52`): verificação de que encontros de atividades canceladas não participam do conflito de sala não possui teste em `api/verificacoes/m1-fatia2.spec.js`.
   - R6 (`specs/M1-grade-de-atividades.md:54`): testes de `CAMPO_NAO_EDITAVEL` (`api/verificacoes/m1-fatia3.spec.js:43`) cobrem apenas `salaId`, sem testes específicos para alteração isolada de `tipo` ou `encontros`.
   - R10 (`specs/M1-grade-de-atividades.md:57`): o requisito de que atividades canceladas continuam aparecendo na listagem de `GET /atividades` não é validado em `api/verificacoes/m1-fatia1.spec.js:28`.

## Veredito

O módulo M1 não pode ser aceito até que se atribua origem por pergunta da entrevista (P-xx) para R11, implemente-se o teste automatizado para R7 e cubram-se os subcenários pendentes de R2, R3, R4, R6 e R10.
