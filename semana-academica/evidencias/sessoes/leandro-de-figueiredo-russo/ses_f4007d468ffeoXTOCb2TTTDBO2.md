# Criar subagente revisor-de-contrato

| | |
|---|---|
| Sessão | `ses_f4007d468ffeoXTOCb2TTTDBO2` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 20/09 14:58 → 20/09 15:00 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 7 |
| Tokens de entrada / saída | 85.431 / 3.797 |
| Skills | novo-subagente |
| Subagentes | — |
| Execuções de teste | 0 vermelhas, 0 verdes |
| TDD | 0 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 0 de teste, 0 de código, 0 de entrevista, 0 de spec, 1 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `20/09 14:58` **prompt** — Use a skill novo-subagente para criar o subagente revisor-de-contrato. O objetivo desse subagente é revisar a implementação da API e da interface comparando-as com o contrato definido em contrato-api.md. Ele deve verificar principalmente: - rotas; - métodos HTTP; - campos de entrada e saída; - códigos de erro; - formatos definidos no contrato. O subagente deve apenas analisar e apontar divergênci…
- `20/09 14:58` carrega a skill **novo-subagente**
- `20/09 14:58` edita contexto `.opencode/agent/revisor-de-contrato.md`
- `20/09 15:00` **prompt** — opencode debug agent revisor-de-contrato
