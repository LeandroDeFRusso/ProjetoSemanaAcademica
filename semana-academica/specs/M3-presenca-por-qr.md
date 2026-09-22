# Spec — M3 — Presença por QR Code e Registro Manual

## 1. Objetivo
Permitir que a organização gere códigos temporários para controle de presença em encontros, que participantes registrem sua presença via QR Code (com suporte a envio offline com tolerância) e que a organização realize registros manuais de presença com justificativa e limite porcentual, além de listar as presenças de um encontro.

## 2. Fora de escopo
- Gestão de atividades, salas e encontros (tratado em M1).
- Inscrições e lista de espera em atividades (tratado em M2).
- Emissão de certificados e extrato de horas (tratado em M4).
- Painel gerencial, estatísticas e bloqueios por faltas (tratado em M5).

## 3. Modelo

### CodigoDoEncontro
- `encontroId`: string (identificador do encontro)
- `codigo`: string (código de 6 caracteres gerado para o minuto atual)
- `trocaEm`: string ISO 8601 (momento em que a tela deve buscar o próximo código)
- `validoAte`: string ISO 8601 (primeiro instante em que este código deixa de ser aceito)

### Presenca
- `id`: string gerada automaticamente (prefixo `pre_` + 8 hexadecimais)
- `encontroId`: string (identificador do encontro)
- `participanteId`: string (identificador do participante)
- `origem`: string `"qr" | "qr_offline" | "manual"`
- `lidoEm`: string ISO 8601 ou `null` (instante da leitura do QR code)
- `registradaEm`: string ISO 8601 (momento em que o registro foi processado/salvo no sistema)
- `justificativa`: string ou `null` (texto descritivo, preenchido apenas quando manual)

## 4. Endpoints

- `GET /encontros/:id/codigo`: Retorna o código dinâmico do encontro (200 `CodigoDoEncontro`). Exclusivo para organização (`403 SOMENTE_ORGANIZACAO`).
- `POST /encontros/:id/presencas`: Registra a presença do participante via QR code ou offline (201 `Presenca` na primeira vez; 200 `Presenca` em tentativas duplicadas/subsequentes). Exclusivo para participantes (`403 SOMENTE_PARTICIPANTE`).
- `POST /encontros/:id/presencas/manual`: Registra presença manualmente pela organização (201 `Presenca` na primeira vez; 200 `Presenca` em duplicadas). Exclusivo para organização (`403 SOMENTE_ORGANIZACAO`).
- `GET /encontros/:id/presencas`: Retorna a lista de presenças do encontro (200 `[Presenca]`). Exclusivo para organização (`403 SOMENTE_ORGANIZACAO`).

## 5. Regras

- R1 (P1, RN-301, RN-302): Janela de tempo para QR e código (`GET /encontros/:id/codigo`, `POST /encontros/:id/presencas`): A janela de registro começa 15 minutos antes do início do encontro e termina 30 minutos depois do início, com as bordas incluídas. Fora dessa janela, requisições de obtenção de código (`GET /encontros/:id/codigo`) ou registro de presença (`POST /encontros/:id/presencas`) devem ser recusadas com `422 FORA_DA_JANELA`. Se a atividade estiver cancelada (`atividade.situacao === 'cancelada'`), a obtenção de código também deve ser recusada com `422 ATIVIDADE_CANCELADA`.
- R2 (P2, RN-303, RN-304, RN-308): Validação de código e tolerância offline (`POST /encontros/:id/presencas`): O código do encontro muda a cada minuto. O sistema aceita o código do minuto atual e o código do minuto anterior. Caso o código enviado não corresponda a nenhum desses dois válidos, a operação deve ser recusada com `422 CODIGO_INVALIDO`. O campo `lidoEm` é opcional na requisição. Quando `lidoEm` é fornecido, a validação da janela e do minuto do código considera o instante informado em `lidoEm` (momento da leitura offline) e não o momento do envio ao servidor. Quando `lidoEm` está ausente, considera-se o momento atual do envio.
- R3 (P2, RN-309, RN-310): Prazo de sincronização offline (`POST /encontros/:id/presencas`): O envio de presença offline (com `lidoEm` anterior ao momento de envio) pode ser feito até 2 horas depois do fim do encontro. Caso o envio ocorra após esse prazo (mais de 2 horas após o término do encontro), a operação deve ser recusada com `422 SINCRONIZACAO_TARDIA`.
- R4 (P3, RN-306): Verificação de inscrição prévia (`NAO_INSCRITO`): Tanto no registro de presença por QR (`POST /encontros/:id/presencas`) quanto no registro manual (`POST /encontros/:id/presencas/manual`), só pode registrar presença o participante que possui inscrição confirmada (`status === 'confirmada'`) na atividade correspondente. Caso o participante não possua inscrição confirmada, a operação deve ser recusada com `403 NAO_INSCRITO`.
- R5 (P4, RN-311, RN-313): Presença manual pela organização (`POST /encontros/:id/presencas/manual`): A presença manual só pode ser registrada pela organização para um participante com inscrição confirmada. É obrigatória uma justificativa com no mínimo 10 caracteres. Caso a justificativa esteja ausente ou tenha menos de 10 caracteres, a operação deve ser recusada com `422 JUSTIFICATIVA_OBRIGATORIA`. O total de presenças manuais por encontro é limitado a 10% do total de inscrições confirmadas da atividade no encontro, arredondando para cima. Caso esse limite seja excedido, a operação deve ser recusada com `422 LIMITE_DE_MANUAIS`.
- R6 (P5): Listagem de presenças (`GET /encontros/:id/presencas`): A listagem de presenças é exclusiva para usuários da organização (`403 SOMENTE_ORGANIZACAO`) e retorna status `200` com a lista de objetos `[Presenca]` registrados no encontro.
- R7 (Contrato): Restrições de papel nas rotas de presença: `GET /encontros/:id/codigo`, `POST /encontros/:id/presencas/manual` e `GET /encontros/:id/presencas` exigem papel de organização (`403 SOMENTE_ORGANIZACAO`). `POST /encontros/:id/presencas` exige papel de participante (`403 SOMENTE_PARTICIPANTE`). Tentativas por papéis inadequados ou sem autenticação respondem `401` ou `403`.

## 6. Critérios de aceite

1. (R1) `GET /encontros/:id/codigo` fora da janela de registro (mais de 15 min antes ou mais de 30 min depois do início) → `422 FORA_DA_JANELA`.
2. (R1) `GET /encontros/:id/codigo` dentro da janela válida → `200` com objeto `CodigoDoEncontro`.
3. (R2) `POST /encontros/:id/presencas` com código do minuto atual ou do minuto anterior → `201` (ou `200` se já registrada).
4. (R2) `POST /encontros/:id/presencas` com código inválido (diferente do atual e do anterior) → `422 CODIGO_INVALIDO`.
5. (R2) `POST /encontros/:id/presencas` validando janela e código com base em `lidoEm` (leitura offline).
6. (R3) `POST /encontros/:id/presencas` com `lidoEm` enviado mais de 2 horas após o fim do encontro → `422 SINCRONIZACAO_TARDIA`.
7. (R4) `POST /encontros/:id/presencas` ou `POST /encontros/:id/presencas/manual` por participante sem inscrição confirmada → `403 NAO_INSCRITO`.
8. (R5) `POST /encontros/:id/presencas/manual` com justificativa com menos de 10 caracteres ou ausente → `422 JUSTIFICATIVA_OBRIGATORIA`.
9. (R5) `POST /encontros/:id/presencas/manual` excedendo o limite de 10% (arredondado para cima) das inscrições confirmadas do encontro → `422 LIMITE_DE_MANUAIS`.
10. (R6) `GET /encontros/:id/presencas` pela organização → `200` com `[Presenca]`.
11. (R7) Chamada de `GET /encontros/:id/codigo` ou `POST /encontros/:id/presencas/manual` por participante → `403 SOMENTE_ORGANIZACAO`.
12. (R7) Chamada de `POST /encontros/:id/presencas` por usuário da organização → `403 SOMENTE_PARTICIPANTE`.

## 7. Como isto será verificado
Testes automatizados via requisições HTTP (Supertest / fetch) no servidor Express (`criarServidor()`), utilizando o modo de teste com relógio controlado (`/_teste/relogio` e `/_teste/reset`) para simular o avanço do tempo, janelas de encontro, expiração de códigos e prazos de sincronização offline.

## 8. Fatias de entrega
- **Fatia 1:** Geração de código do encontro e janela de tempo (`GET /encontros/:id/codigo`, `R1`, `R7`).
- **Fatia 2:** Registro de presença por QR code online/offline e tolerância de código e prazo (`POST /encontros/:id/presencas`, `R2`, `R3`, `R4`, `R7`).
- **Fatia 3:** Presença manual pela organização com justificativa e limite, e listagem de presenças (`POST /encontros/:id/presencas/manual`, `GET /encontros/:id/presencas`, `R5`, `R6`, `R7`).
