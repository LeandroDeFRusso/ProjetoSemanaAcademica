# Respostas pendentes em M3-presenca-por-qr.md

| | |
|---|---|
| Sessão | `ses_f38a96618ffeugKbzkXFaL7FhS` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 22/09 01:18 → 22/09 01:34 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 29 |
| Tokens de entrada / saída | 342.076 / 5.349 |
| Skills | — |
| Subagentes | — |
| Execuções de teste | 0 vermelhas, 0 verdes |
| TDD | 0 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 0 de teste, 0 de código, 5 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `22/09 01:18` **prompt** — Vamos responder as perguntas marcadas como PENDENTE em entrevistas/M3-presenca-por-qr.md, uma de cada vez. Eu respondo com o que li no documento de requisitos, citando a regra; registre a minha resposta e ponha a regra na coluna Fonte. Não crie perguntas novas e não mexa nas perguntas já respondidas.
- `22/09 01:21` **prompt** — P1: A janela de registro começa 15 minutos antes do início do encontro e termina 30 minutos depois do início, com as bordas incluídas. Fora dessa janela, a organização não obtém o código. Fonte: RN-301 e RN-302
- `22/09 01:21` edita entrevista `entrevistas/M3-presenca-por-qr.md`
- `22/09 01:32` **prompt** — P2: O código muda a cada minuto. São aceitos o código do minuto atual e o do minuto anterior. Quando existe lidoEm, a validação considera o instante da leitura, e não o momento do envio. O envio offline pode ser feito até 2 horas depois do fim do encontro; após esse prazo, retorna SINCRONIZACAO_TARDIA. O lidoEm é opcional na requisição. Fonte: RN-303, RN-304, RN-308, RN-309 e RN-310
- `22/09 01:32` edita entrevista `entrevistas/M3-presenca-por-qr.md`
- `22/09 01:32` **prompt** — P3: Só pode registrar presença quem possui inscrição confirmada. Caso contrário, retorna NAO_INSCRITO com status 403. Fonte: RN-306
- `22/09 01:32` edita entrevista `entrevistas/M3-presenca-por-qr.md`
- `22/09 01:32` **prompt** — P4: A presença manual só pode ser registrada pela organização para um participante com inscrição confirmada. É obrigatória uma justificativa de pelo menos 10 caracteres. O limite é de 10% das inscrições confirmadas por encontro, arredondando para cima. Fonte: RN-311 e RN-313
- `22/09 01:32` edita entrevista `entrevistas/M3-presenca-por-qr.md`
- `22/09 01:33` **prompt** — P5: A listagem de presenças é feita pelo endpoint GET /encontros/:id/presencas. Essa rota é exclusiva da organização e retorna status 200 com uma lista [Presenca]. O documento não especifica regras adicionais de ordenação ou filtragem.
- `22/09 01:34` edita entrevista `entrevistas/M3-presenca-por-qr.md`
