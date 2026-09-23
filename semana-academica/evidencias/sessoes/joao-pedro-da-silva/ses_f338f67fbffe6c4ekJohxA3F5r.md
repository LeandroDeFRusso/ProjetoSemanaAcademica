# Implementação da Fatia 1 - M4 de Certificados

| | |
|---|---|
| Sessão | `ses_f338f67fbffe6c4ekJohxA3F5r` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 23/09 01:05 → 23/09 01:19 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 40 |
| Tokens de entrada / saída | 437.690 / 15.969 |
| Skills | — |
| Subagentes | — |
| Execuções de teste | 6 vermelhas, 6 verdes |
| TDD | 2 ciclo(s) vermelho → verde · 1 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 5 de teste, 4 de código, 0 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `23/09 01:05` **prompt** — Use as skills padrao-design e front-end. Implemente só a Fatia 1 - M4: meus certificados; extrato de horas; verificação pública de certificado pelo código.
- `23/09 01:05` roda `npm test` → **vermelho**
- `23/09 01:07` roda `npx vitest run` → verde (20 passaram)
- `23/09 01:10` edita teste `app/tests/mocks/handlers.js`
- `23/09 01:10` edita teste `app/tests/MeusCertificados.test.js`
- `23/09 01:10` roda `npx vitest run MeusCertificados.test.js` → **vermelho** — _teste novo falhando, como deve ser_
- `23/09 01:10` edita código `app/src/components/MeusCertificados.vue`
- `23/09 01:10` roda `npx vitest run MeusCertificados.test.js` → **vermelho** (1 passaram, 3 falharam)
- `23/09 01:12` edita código `app/src/components/MeusCertificados.vue`
- `23/09 01:13` roda `npx vitest run MeusCertificados.test.js` → **vermelho** (3 passaram, 1 falharam)
- `23/09 01:13` edita teste `app/tests/mocks/handlers.js`
- `23/09 01:13` roda `npx vitest run MeusCertificados.test.js` → verde (4 passaram) — _teste novo já nasceu verde_
- `23/09 01:15` edita teste `app/tests/ExtratoHoras.test.js`
- `23/09 01:15` roda `npx vitest run ExtratoHoras.test.js` → **vermelho** — _teste novo falhando, como deve ser_
- `23/09 01:15` edita código `app/src/components/ExtratoHoras.vue`
- `23/09 01:15` roda `npx vitest run ExtratoHoras.test.js` → verde (2 passaram) — _fecha um ciclo vermelho → verde_
- `23/09 01:16` edita teste `app/tests/VerificacaoCertificado.test.js`
- `23/09 01:16` roda `npx vitest run VerificacaoCertificado.test.js` → **vermelho** — _teste novo falhando, como deve ser_
- `23/09 01:18` edita código `app/src/components/VerificacaoCertificado.vue`
- `23/09 01:18` roda `npx vitest run VerificacaoCertificado.test.js` → verde (2 passaram) — _fecha um ciclo vermelho → verde_
- `23/09 01:18` roda `npx vitest run` → verde (28 passaram)
- `23/09 01:19` roda `npm test` → verde (78 passaram)
