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
| | **Total: 3 sessões** | 57 | novo-subagente, grilling | — | 0 / 0 | 0 | 0 | 0 | — |
