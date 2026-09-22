# Entrevista M3 — Presença por QR

## Rodada 1

| # | Pergunta | Resposta | Fonte |
|---|---|---|---|
| P1 | Janela de tempo para QR e código (`GET /encontros/:id/codigo`, `FORA_DA_JANELA`) | A janela de registro começa 15 minutos antes do início do encontro e termina 30 minutos depois do início, com as bordas incluídas. Fora dessa janela, a organização não obtém o código. | RN-301 e RN-302 |
| P2 | Registro de presença e tolerância offline (`POST /encontros/:id/presencas`, `CODIGO_INVALIDO`, `SINCRONIZACAO_TARDIA`) | O código muda a cada minuto. São aceitos o código do minuto atual e o do minuto anterior. Quando existe lidoEm, a validação considera o instante da leitura, e não o momento do envio. O envio offline pode ser feito até 2 horas depois do fim do encontro; após esse prazo, retorna SINCRONIZACAO_TARDIA. O lidoEm é opcional na requisição. | RN-303, RN-304, RN-308, RN-309 e RN-310 |
| P3 | Verificação de inscrição prévia (`NAO_INSCRITO`) | Só pode registrar presença quem possui inscrição confirmada. Caso contrário, retorna NAO_INSCRITO com status 403. | RN-306 |
| P4 | Presença manual pela organização (`POST /encontros/:id/presencas/manual`, `JUSTIFICATIVA_OBRIGATORIA`, `LIMITE_DE_MANUAIS`) | A presença manual só pode ser registrada pela organização para um participante com inscrição confirmada e dentro da janela de registro, que começa 15 minutos antes do início do encontro e termina 30 minutos depois do início, com as bordas incluídas. Fora dessa janela, retorna 422 FORA_DA_JANELA. É obrigatória uma justificativa de pelo menos 10 caracteres. O limite é de 10% das inscrições confirmadas por encontro, arredondando para cima. | RN-301, RN-302, RN-311 e RN-313 |
| P5 | Listagem de presenças (`GET /encontros/:id/presencas`) | A listagem de presenças é feita pelo endpoint GET /encontros/:id/presencas. Essa rota é exclusiva da organização e retorna status 200 com uma lista [Presenca]. O documento não especifica regras adicionais de ordenação ou filtragem. | contrato da API |
