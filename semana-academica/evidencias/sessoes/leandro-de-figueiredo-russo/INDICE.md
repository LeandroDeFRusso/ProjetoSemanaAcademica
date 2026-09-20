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
| | **Total: 10 sessões** | 151 | novo-subagente, grilling (3), to-spec (2), tdd | — | 3 / 7 | 1 | 2 | 1 | — |
