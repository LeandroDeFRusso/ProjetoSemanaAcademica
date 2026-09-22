# Sessões — Rafaela Queen

Cada execução de teste é lida pelo que mudou desde a anterior:

- **Ciclo** — vermelho logo depois de mexer só em teste, e depois verde logo depois de mexer só em código. É o TDD.
- **Nasceu verde** — verde logo depois de mexer só em teste. Ou o comportamento já existia, ou o teste não testa o que diz.
- **Juntos** — teste e código mudaram antes da mesma execução. Não houve vermelho para ver.

**Alertas:** *colou* = prompt com 10 palavras seguidas ou mais iguais às do documento de requisitos (só aparece quando o resumo é gerado com `--requisitos`); *leu* = o agente acessou um arquivo de requisitos; *anexou* = o documento foi anexado à conversa.

Requisições são chamadas ao modelo: cada passo do agente é uma. Skills contam tanto a ferramenta `skill` quanto o comando `/nome`.

| Início | Sessão | Requisições | Skills | Subagentes | Vermelhas / verdes | Ciclos | Nasceu verde | Juntos | Alertas |
|---|---|---|---|---|---|---|---|---|---|
| 21/09 14:57 | [Levantar regras de negócio M2 Inscrições](ses_f3ae2c4b6ffe6rvgHw9mgFSkvi.md) | 29 | grilling | — | 0 / 0 | 0 | 0 | 0 | — |
| 21/09 20:17 | [Erro ao exportar sessão ses_f39cc3d8fffeNLkj6nxINs9gj8](ses_f39bd9637ffekUyK6wBvM36UFa.md) | 12 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 21/09 20:30 | [Resolução de pendências em M2-inscricoes.md](ses_f39b1ed95ffeu3Yu47MnZfA5p1.md) | 17 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 21/09 20:40 | [Geração de specs/M2-inscricoes.md](ses_f39a87949ffeXGkvnamwDpw571.md) | 8 | to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
| 21/09 20:55 | [New session - 2026-09-21T23:55:26.661Z](ses_f399aa3baffedLK7csWCNmFWoj.md) | 58 | tdd | — | 8 / 7 | 1 | 3 | 0 | — |
| 21/09 21:16 | [TDD para fatia 2 de M2-inscricoes.md](ses_f3987bd06ffe3UDwr4P12t6k6c.md) | 28 | tdd | — | 3 / 6 | 2 | 2 | 0 | — |
| 21/09 21:23 | [TDD da fatia 3 em specs/M2-inscricoes.md](ses_f398124b8ffeD1keZ2qpx0RrjJ.md) | 24 | tdd | — | 3 / 5 | 1 | 2 | 0 | — |
| 21/09 21:29 | [TDD da fatia 4 em specs/M2-inscricoes.md](ses_f397b1d41ffecK5wMvDXQDU1iA.md) | 33 | tdd | — | 5 / 4 | 1 | 2 | 0 | — |
| 21/09 21:42 | [Auditoria do módulo M2 contra especificações](ses_f396f686fffeGixOUMK8X25jAC.md) | 15 | — | auditor | 2 / 1 | 0 | 0 | 0 | — |
| 21/09 21:47 | [New session - 2026-09-22T00:47:08.065Z](ses_f396b50deffeMkRLgyeq4J9AMv.md) | 0 | — | — | 0 / 0 | 0 | 0 | 0 | — |
| 21/09 21:47 | [Auditoria do módulo M2 contra especificações](ses_f396a919cffePrPJPIDlusklQS.md) | 12 | — | auditor | 1 / 1 | 0 | 0 | 0 | — |
| 21/09 22:04 | [Telas M2 de inscrições e fila de espera](ses_f395b2a1affeky4X8II7kF5HB6.md) | 30 | front-end, padrao-design | — | 3 / 0 | 0 | 0 | 1 | — |
| 21/09 22:36 | [Fatia 2: Telas de inscrições e espera](ses_f393e549fffe0i671Oc8VRzx59.md) | 39 | tdd, front-end | — | 4 / 2 | 0 | 0 | 0 | — |
| | **Total: 13 sessões** | 305 | grilling, to-spec, tdd (5), front-end (2), padrao-design | auditor (2) | 29 / 26 | 5 | 9 | 1 | — |
