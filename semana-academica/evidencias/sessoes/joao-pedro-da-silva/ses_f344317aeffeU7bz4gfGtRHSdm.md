# Respostas pendentes em M4-certificados.md

| | |
|---|---|
| Sessão | `ses_f344317aeffeU7bz4gfGtRHSdm` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 22/09 21:49 → 22/09 21:50 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 20 |
| Tokens de entrada / saída | 265.027 / 3.257 |
| Skills | — |
| Subagentes | — |
| Execuções de teste | 0 vermelhas, 0 verdes |
| TDD | 0 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 0 de teste, 0 de código, 5 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `22/09 21:49` **prompt** — Vamos responder as perguntas marcadas como PENDENTE em entrevistas/M4-certificados.md, uma de cada vez. Eu respondo com o que li no documento de requisitos, citando a regra; registre a minha resposta e ponha a regra na coluna Fonte. Não crie perguntas novas e não mexa nas perguntas já respondidas.
- `22/09 21:49` **prompt** — P1 — RN-404: Frequência mínima de 75% dos encontros, calculada sem arredondar a favor do participante. Em inteiros: presenças × 4 ≥ encontros × 3. Se não bater, retorna PRESENCA_INSUFICIENTE.
- `22/09 21:49` edita entrevista `entrevistas/M4-certificados.md`
- `22/09 21:49` **prompt** — P2 — RN-401: A atividade só é considerada encerrada a partir do fim do último encontro. Antes disso, qualquer tentativa de emissão retorna ATIVIDADE_NAO_ENCERRADA.
- `22/09 21:49` edita entrevista `entrevistas/M4-certificados.md`
- `22/09 21:49` **prompt** — P3 — RN-407: Código no formato SA26-XXXX-XXXX, usando o alfabeto definido na RN-305, único e gerado só na primeira emissão — depois disso nunca muda. Comportamento: 1ª emissão → 201 com o certificado criado. Emissões seguintes da mesma atividade pelo mesmo participante → 200 retornando o mesmo certificado (mesmo código).
- `22/09 21:49` edita entrevista `entrevistas/M4-certificados.md`
- `22/09 21:50` **prompt** — P4 — RN-410 a RN-412: O extrato é calculado na consulta (não persistido) e lista toda atividade elegível, emitida ou não (código null se não emitida). palestrasMinutos / minicursosMinutos: soma da carga horária total das atividades elegíveis de cada tipo. totalMinutos: soma bruta de tudo. aproveitadoMinutos: aplica os tetos — Palestras contam no máximo 240 min (4h) no aproveitado. Depois disso, o…
- `22/09 21:50` edita entrevista `entrevistas/M4-certificados.md`
- `22/09 21:50` **prompt** — P5 — RN-408 + RN-413: A rota é pública (sem X-Usuario), aceita o código em minúsculas. Pela ordem de validação da RN-413, código inexistente/inválido cai no primeiro caso da cadeia → 404.
- `22/09 21:50` edita entrevista `entrevistas/M4-certificados.md`
