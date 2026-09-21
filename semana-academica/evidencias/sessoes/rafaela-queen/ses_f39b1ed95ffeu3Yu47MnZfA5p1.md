# Resolução de pendências em M2-inscricoes.md

| | |
|---|---|
| Sessão | `ses_f39b1ed95ffeu3Yu47MnZfA5p1` |
| Pasta | ProjetoSemanaAcademica/semana-academica |
| Período | 21/09 20:30 → 21/09 20:35 |
| Modelo | google/gemini-3.5-flash-lite |
| Requisições ao modelo | 17 |
| Tokens de entrada / saída | 235.040 / 4.774 |
| Skills | — |
| Subagentes | — |
| Execuções de teste | 0 vermelhas, 0 verdes |
| TDD | 0 ciclo(s) vermelho → verde · 0 teste(s) que já nasceram verdes · 0 vez(es) teste e código juntos |
| Arquivos editados | 0 de teste, 0 de código, 7 de entrevista, 0 de spec, 0 de contexto, 0 de auditoria |
| Alertas | — |

## Linha do tempo

- `21/09 20:30` **prompt** — Vamos responder as perguntas marcadas como PENDENTE em entrevistas/M2-inscricoes.md, uma de cada vez. Eu respondo com o que li no documento de requisitos, citando a regra; registre a minha resposta e ponha a regra na coluna Fonte. Não crie perguntas novas e não mexa nas perguntas já respondidas.
- `21/09 20:31` **prompt** — P1: As inscrições fecham 30 minutos antes do início do primeiro encontro da atividade. Após esse momento, uma nova inscrição deve ser recusada com INSCRICOES_ENCERRADAS. Fonte: RN-202.
- `21/09 20:31` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:31` **prompt** — P2:Havendo vaga disponível, a inscrição é criada com status "confirmada". Quando não há vaga, a inscrição é criada com status "em_espera" e entra no fim da lista de espera. A lotação da atividade não gera erro. A lista de espera segue a ordem de chegada: a posição 1 é a próxima a ser convocada. Fonte: RN-205 e RN-216.
- `21/09 20:32` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:32` **prompt** — P3: O conflito de horário é verificado somente quando a inscrição ocupa vaga. Consideram-se as inscrições nos status "confirmada" ou "convocada", pois esses status ocupam vaga. Inscrições que estão apenas "em_espera" não participam dessa verificação. Existe conflito quando os horários dos encontros se sobrepõem. Horários que apenas encostam não são considerados conflito; por exemplo, uma atividad…
- `21/09 20:32` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:32` **prompt** — P4: O participante pode ter no máximo 3 minicursos ocupando vaga. Para esse limite, contam as inscrições nos status "confirmada" e "convocada". Inscrições "em_espera" não contam, e palestras não entram no limite. Ao tentar realizar uma inscrição que faria o participante ocupar vaga em um 4.º minicurso, a operação deve ser recusada com o erro LIMITE_DE_MINICURSOS. Fonte: RN-207.
- `21/09 20:32` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:34` **prompt** — P5: Quando uma vaga é liberada, o primeiro participante da lista de espera é convocado e recebe um prazo de 2 horas para confirmar a inscrição. O campo "convocadaAte" deve representar esse prazo, mas nunca pode ultrapassar o momento de fechamento das inscrições. Se a vaga for liberada depois do fechamento das inscrições, nenhum participante da espera é convocado. Quando uma convocação vence, a in…
- `21/09 20:34` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:34` **prompt** — P6: O participante pode cancelar a própria inscrição até o início da atividade. Se a atividade já tiver começado, o cancelamento é recusado com o erro ATIVIDADE_JA_INICIADA. Uma inscrição que já esteja nos status "cancelada" ou "expirada" é considerada inativa e não pode ser cancelada novamente, devendo retornar o erro INSCRICAO_INATIVA. Fontes: RN-209 e RN-210.
- `21/09 20:34` edita entrevista `entrevistas/M2-inscricoes.md`
- `21/09 20:35` **prompt** — P7: O erro JA_INSCRITO ocorre quando o participante já possui uma inscrição ativa para a mesma atividade. São consideradas ativas as inscrições nos status "confirmada", "em_espera" ou "convocada". Inscrições nos status "cancelada" ou "expirada" não impedem uma nova inscrição. Nesse caso, o participante pode inscrever-se novamente e, se não houver vaga, entra no fim da lista de espera. O participa…
- `21/09 20:35` edita entrevista `entrevistas/M2-inscricoes.md`
