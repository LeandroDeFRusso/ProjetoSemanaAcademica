# Sessões — João Pedro da Silva

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 22/09 21:30 | [New session - 2026-09-23T00:30:11.098Z](ses_f34547965ffej2qDtfx7VhCBUS.md) | 24 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 22/09 21:49 | [Respostas pendentes em M4-certificados.md](ses_f344317aeffeU7bz4gfGtRHSdm.md) | 20 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 22/09 22:00 | [New session - 2026-09-23T01:00:19.424Z](ses_f3438e19fffe5pXg1TZs28OYjs.md) | 9 | to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
| 22/09 22:07 | [TDD na fatia 1 de M4-certificados.md](ses_f343221c8ffeq0hfXZEOazt65c.md) | 69 | tdd | — | 5 / 6 | 2 | 1 | 0 | — |
| 22/09 22:46 | [TDD na fatia 2 de M4-certificados.md](ses_f340e8eddffed42ZbdNtQGaF7Y.md) | 43 | tdd | — | 11 / 2 | 0 | 2 | 0 | — |
| 22/09 23:14 | [TDD da fatia 3 de specs/M4-certificados.md](ses_f33f54f11ffeOzlsXzpl0y75Sb.md) | 135 | tdd | — | 42 / 6 | 0 | 3 | 0 | — |
| 23/09 01:00 | [Auditoria do módulo M4 contra specs](ses_f33944db3ffelRbIF3S6BhlLzJ.md) | 23 | — | — | 0 / 2 | 0 | 1 | 0 | — |
| 23/09 01:05 | [Implementação da Fatia 1 - M4 de Certificados](ses_f338f67fbffe6c4ekJohxA3F5r.md) | 40 | — | — | 6 / 6 | 2 | 1 | 0 | — |
| | **Total: 8 sessões** | 363 | grilling, to-spec, tdd (3) | — | 64 / 22 | 4 | 8 | 0 | — |
