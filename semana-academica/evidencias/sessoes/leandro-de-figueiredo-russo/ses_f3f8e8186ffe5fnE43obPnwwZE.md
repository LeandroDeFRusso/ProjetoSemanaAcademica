# TDD da fatia 2 de M1-grade-de-atividades.md

| | |
|---|---|
| Sessão | `ses_f3f8e8186ffe5fnE43obPnwwZE` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 20/09 17:10 → 20/09 17:18 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 46 |
| Tokens de entrada / saída | 480.615 / 24.211 |
| Skills | tdd |
| Subagentes | — |
| Execuções de teste | 4 vermelhas, 10 verdes |
| TDD | 4 ciclo(s) vermelho → verde · 4 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 9 de teste, 5 de código, 0 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `20/09 17:10` **prompt** — Use a skill tdd. Implemente só a fatia 2 de specs/M1-grade-de-atividades.md. Um teste por vez: escreva o teste, mostre ele falhando, e só então o código.
- `20/09 17:11` carrega a skill **tdd**
- `20/09 17:11` roda `npm test` → verde (7 passaram)
- `20/09 17:11` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:11` roda `npm test` → **vermelho** (7 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `20/09 17:11` edita código `api/src/server.js`
- `20/09 17:11` roda `npm test` → verde (8 passaram) — _fecha um ciclo vermelho → verde_
- `20/09 17:12` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:12` roda `npm test` → **vermelho** (8 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `20/09 17:12` edita código `api/src/server.js`
- `20/09 17:12` roda `npm test` → verde (9 passaram) — _fecha um ciclo vermelho → verde_
- `20/09 17:12` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:13` roda `npm test` → verde (10 passaram) — _teste novo já nasceu verde_
- `20/09 17:13` edita teste `api/verificacoes/m1-fatia2.spec.js` (2×)
- `20/09 17:13` roda `npm test` → **vermelho** (10 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `20/09 17:14` edita código `api/src/server.js`
- `20/09 17:14` roda `npm test` → verde (11 passaram) — _fecha um ciclo vermelho → verde_
- `20/09 17:14` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:14` roda `npm test` → **vermelho** (11 passaram, 1 falharam) — _teste novo falhando, como deve ser_
- `20/09 17:15` edita código `api/src/server.js` (2×)
- `20/09 17:16` roda `npm test` → verde (12 passaram) — _fecha um ciclo vermelho → verde_
- `20/09 17:17` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:17` roda `npm test` → verde (13 passaram) — _teste novo já nasceu verde_
- `20/09 17:17` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:17` roda `npm test` → verde (14 passaram) — _teste novo já nasceu verde_
- `20/09 17:17` edita teste `api/verificacoes/m1-fatia2.spec.js`
- `20/09 17:18` roda `npm test` → verde (15 passaram) — _teste novo já nasceu verde_
- `20/09 17:18` roda `npm test` → verde (15 passaram)
