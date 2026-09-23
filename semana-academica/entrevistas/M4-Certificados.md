# Entrevista M4 — Certificados

## Rodada 1

| # | Pergunta | Resposta | Fonte |
|---|---|---|---|
| P1 | Critério de presença mínima (`PRESENCA_INSUFICIENTE`) | Frequência mínima de 75% dos encontros, calculada sem arredondar a favor do participante. Em inteiros: presenças × 4 ≥ encontros × 3. Se não bater, retorna PRESENCA_INSUFICIENTE. | RN-404 |
| P2 | Condição de atividade encerrada (`ATIVIDADE_NAO_ENCERRADA`) | A atividade só é considerada encerrada a partir do fim do último encontro. Antes disso, qualquer tentativa de emissão retorna ATIVIDADE_NAO_ENCERRADA. | RN-401 |
| P3 | Formato e comportamento da emissão (`POST /atividades/:id/certificado`) | Código no formato SA26-XXXX-XXXX, usando o alfabeto definido na RN-305, único e gerado só na primeira emissão — depois disso nunca muda. Comportamento: 1ª emissão → 201 com o certificado criado. Emissões seguintes da mesma atividade pelo mesmo participante → 200 retornando o mesmo certificado (mesmo código). | RN-407 |
| P4 | Cálculo do Extrato (`GET /extrato`) | O extrato é calculado na consulta (não persistido) e lista toda atividade elegível, emitida ou não (código null se não emitida). palestrasMinutos / minicursosMinutos: soma da carga horária total das atividades elegíveis de cada tipo. totalMinutos: soma bruta de tudo. aproveitadoMinutos: aplica os tetos — Palestras contam no máximo 240 min (4h) no aproveitado. Depois disso, o aproveitado total é limitado a no máximo 1200 min (20h). | RN-410 a RN-412 |
| P5 | Verificação pública de certificados (`GET /certificados/:codigo`) | A rota é pública (sem X-Usuario), aceita o código em minúsculas. Pela ordem de validação da RN-413, código inexistente/inválido cai no primeiro caso da cadeia → 404. | RN-408 + RN-413 |
