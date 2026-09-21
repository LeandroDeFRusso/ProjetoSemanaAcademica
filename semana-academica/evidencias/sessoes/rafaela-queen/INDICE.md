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
| | **Total: 4 sessões** | 66 | grilling, to-spec | — | 0 / 0 | 0 | 0 | 0 | — |
