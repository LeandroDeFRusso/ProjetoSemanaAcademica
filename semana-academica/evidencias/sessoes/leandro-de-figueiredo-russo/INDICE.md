# Sessões — Leandro de Figueiredo Russo

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 20/09 14:58 | [Criar subagente revisor-de-contrato](ses_f4007d468ffeoXTOCb2TTTDBO2.md) | 7 | novo-subagente | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 15:04 | [Requisitos M1 Grade de Atividades](ses_f4002acceffeijQhjNYXpjqfDp.md) | 13 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 15:11 | [Respostas pendentes em M1-grade-de-atividades.md](ses_f3ffb8c79ffelNlKbYK0c3kZbE.md) | 37 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 15:49 | [Specs M1-grade-de-atividades](ses_f3fd91cecffekxtfCPfn6gHvh7.md) | 10 | to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 16:02 | [TDD fatia 1 specs/M1-grade-de-atividades.md](ses_f3fcd58d9ffe6ZMoewCO6xDeg8.md) | 30 | tdd | — | 3 / 4 | 1 | 2 | 1 | — |
| 20/09 16:18 | [Pergunta P10: transições de situacao](ses_f3fbebfb3ffeTeRp9rZOK5yKjr.md) | 3 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 16:19 | [Resposta da P10 em M1-grade-de-atividades](ses_f3fbdc27bffeeKdw4DdHRmDCpA.md) | 12 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 16:21 | [P10: Mudança de situacao em grade de atividades](ses_f3fbb9dd6ffeE9tXuRhqYq5Qe3.md) | 5 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 16:23 | [New session - 2026-09-20T19:23:26.883Z](ses_f3fba04dcffe0wxyRRE2ILICkw.md) | 14 | — | — | 0 / 1 | 0 | 0 | 0 | — |
| 20/09 16:30 | [Atualização de specs/M1-grade-de-atividades.md](ses_f3fb3ff64ffeCKy5CfK4oOTPBJ.md) | 20 | to-spec | — | 0 / 2 | 0 | 0 | 0 | — |
| 20/09 16:59 | [New session - 2026-09-20T19:59:11.081Z](ses_f3f994d16ffexITw0xqz7pqYKA.md) | 15 | tdd | — | 1 / 2 | 1 | 0 | 0 | — |
| 20/09 17:10 | [TDD da fatia 2 de M1-grade-de-atividades.md](ses_f3f8e8186ffe5fnE43obPnwwZE.md) | 46 | tdd | — | 4 / 10 | 4 | 4 | 0 | — |
| 20/09 17:23 | [New session - 2026-09-20T20:23:46.078Z](ses_f3f82cb61ffef4PKqqoa1Qe3ps.md) | 22 | tdd | — | 0 / 5 | 0 | 3 | 0 | — |
| 20/09 17:31 | [New session - 2026-09-20T20:31:54.605Z](ses_f3f7b5712ffex7vbbGtv9LCMLn.md) | 18 | tdd | — | 1 / 3 | 0 | 1 | 2 | — |
| 20/09 17:37 | [New session - 2026-09-20T20:37:51.669Z](ses_f3f75e44affekhHXj9KsE85mXe.md) | 9 | — | auditor | 0 / 0 | 0 | 0 | 0 | — |
| 20/09 17:58 | [New session - 2026-09-20T20:58:45.895Z](ses_f3f62c0f8ffesokWJyxV4kJTYy.md) | 37 | tdd | — | 0 / 8 | 0 | 7 | 0 | — |
| | **Total: 16 sessões** | 298 | novo-subagente, grilling (3), to-spec (2), tdd (6) | auditor | 9 / 35 | 6 | 17 | 3 | — |
