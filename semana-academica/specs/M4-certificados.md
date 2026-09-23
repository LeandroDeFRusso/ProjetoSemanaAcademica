# Spec — M4 — Certificados e Extrato

## 1. Objetivo
Permitir que participantes emitam certificados de atividades concluídas (com base em presença mínima e encerramento da atividade), consultem seus certificados emitidos, obtenham o extrato de horas complementares computadas com aplicação de tetos, e que qualquer pessoa verifique publicamente a autenticidade de um certificado por seu código.

## 2. Fora de escopo
- Gestão de atividades, salas e encontros (tratado em M1).
- Inscrições e lista de espera em atividades (tratado em M2).
- Registro de presenças por QR code e manual (tratado em M3).
- Painel gerencial, estatísticas e bloqueios por faltas (tratado em M5).

## 3. Modelo

### Certificado
- `codigo`: string (formato `SA26-XXXX-XXXX`, alfabeto da RN-305)
- `atividadeId`: string
- `participanteId`: string
- `cargaHorariaMinutos`: número (minutos)
- `presencas`: número
- `encontros`: número
- `emitidoEm`: string ISO 8601

### Verificacao
- `codigo`: string
- `participante`: string (nome do participante)
- `atividade`: string (título da atividade)
- `cargaHorariaMinutos`: número
- `emitidoEm`: string ISO 8601

### Extrato
- `itens`: array de objetos `ItemExtrato`
  - `atividadeId`: string
  - `titulo`: string
  - `tipo`: string (`palestra`, `minicurso`, etc.)
  - `cargaHorariaMinutos`: número
  - `codigo`: string ou `null` (código do certificado se emitido, `null` se não emitido)
- `palestrasMinutos`: número (soma bruta da carga horária de palestras elegíveis)
- `minicursosMinutos`: número (soma bruta da carga horária de minicursos elegíveis)
- `totalMinutos`: número (soma bruta de tudo)
- `aproveitadoMinutos`: número (valor computado após aplicação dos tetos: palestras contam no máximo 240 min; total aproveitado limitado a no máximo 1200 min).

## 4. Endpoints

- `POST /atividades/:id/certificado`: Emite ou recupera o certificado da atividade para o participante autenticado (201 na primeira emissão, 200 nas seguintes). Exclusivo para participantes (`403`).
- `GET /certificados`: Retorna a lista de certificados já emitidos pelo participante autenticado (200 `[Certificado]`). Exclusivo para participantes (`403`).
- `GET /certificados/:codigo`: Rota pública (sem `X-Usuario`) que verifica um certificado pelo código (200 `Verificacao` ou 404 se inválido/inexistente).
- `GET /extrato`: Retorna o extrato de horas complementares do participante autenticado (200 `Extrato`). Exclusivo para participantes (`403`).

## 5. Regras

- **R1 (P1, RN-404)**: Critério de presença mínima (`PRESENCA_INSUFICIENTE`): A emissão de certificado exige frequência mínima de 75% dos encontros da atividade, calculada sem arredondar a favor do participante. Em termos inteiros: presenças × 4 ≥ encontros × 3. Caso o participante não atinja esse mínimo, a operação deve ser recusada com status `422 PRESENCA_INSUFICIENTE`.
- **R2 (P2, RN-401)**: Condição de atividade encerrada (`ATIVIDADE_NAO_ENCERRADA`): A emissão de certificado (`POST /atividades/:id/certificado`) exige que a atividade esteja encerrada. A atividade só é considerada encerrada a partir do fim do último encontro. Antes disso, qualquer tentativa de emissão deve ser recusada com status `422 ATIVIDADE_NAO_ENCERRADA`.
- **R3 (P3, RN-305, RN-407)**: Formato e comportamento da emissão (`POST /atividades/:id/certificado`): O código do certificado é gerado no formato `SA26-XXXX-XXXX`, utilizando o alfabeto definido na RN-305, sendo único e gerado exclusivamente na primeira emissão (permanecendo inalterado nas consultas subsequentes). Na 1ª emissão, responde com `201` e o objeto `Certificado` criado. Emissões seguintes da mesma atividade pelo mesmo participante respondem com `200` retornando o mesmo certificado (mesmo código).
- **R4 (P4, RN-410, RN-411, RN-412)**: Cálculo do Extrato (`GET /extrato`): O extrato é calculado dinamicamente na consulta (não persistido) e lista toda atividade elegível do participante, emitida ou não (`codigo` igual a `null` se não emitida). `palestrasMinutos` e `minicursosMinutos` representam a soma da carga horária total das atividades elegíveis de cada tipo. `totalMinutos` é a soma bruta de tudo. `aproveitadoMinutos` aplica os tetos regulamentares: palestras contam no máximo 240 min (4h) no aproveitado, e o aproveitado total é limitado a no máximo 1200 min (20h).
- **R5 (P5, RN-408, RN-413)**: Verificação pública de certificados (`GET /certificados/:codigo`): A rota é pública (não exige cabeçalho `X-Usuario`) e aceita o código em minúsculas. Conforme a ordem de validação da RN-413, código inexistente ou inválido cai no primeiro caso da cadeia e deve ser recusado com status `404`.
- **R6 (Contrato)**: Restrições de papel e autenticação nas rotas de certificados e extrato: As rotas `POST /atividades/:id/certificado`, `GET /certificados` e `GET /extrato` exigem autenticação de participante (`X-Usuario` válido de um participante). Requisições sem cabeçalho ou com usuário desconhecido respondem `401 USUARIO_DESCONHECIDO`. Tentativas por usuários da organização respondem `403`. A rota `GET /certificados/:codigo` é pública e não exige `X-Usuario`.

## 6. Critérios de aceite

1. (R1) `POST /atividades/:id/certificado` com frequência inferior a 75% (presenças × 4 < encontros × 3) → `422 PRESENCA_INSUFICIENTE`.
2. (R1) `POST /atividades/:id/certificado` com frequência igual ou superior a 75% (presenças × 4 ≥ encontros × 3) → permitido quanto à presença.
3. (R2) `POST /atividades/:id/certificado` antes do fim do último encontro da atividade → `422 ATIVIDADE_NAO_ENCERRADA`.
4. (R3) `POST /atividades/:id/certificado` na primeira emissão bem-sucedida → `201` com `Certificado` contendo código no formato `SA26-XXXX-XXXX`.
5. (R3) `POST /atividades/:id/certificado` em emissões subsequentes da mesma atividade pelo mesmo participante → `200` retornando o mesmo certificado e código.
6. (R4) `GET /extrato` listando atividades elegíveis (emitidas com código e não emitidas com `codigo: null`), somando `palestrasMinutos`, `minicursosMinutos`, `totalMinutos` e aplicando os tetos em `aproveitadoMinutos` (palestras máx 240 min, total máx 1200 min).
7. (R5) `GET /certificados/:codigo` com código válido (inclusive em minúsculas) sem cabeçalho `X-Usuario` → `200` com `Verificacao`.
8. (R5) `GET /certificados/:codigo` com código inexistente ou inválido → `404`.
9. (R6) Chamada de rotas de certificado/extrato por usuário da organização ou sem `X-Usuario` (exceto `/certificados/:codigo`) → `401` ou `403`.

## 7. Como isto será verificado
Testes automatizados via requisições HTTP (Supertest / fetch) no servidor Express (`criarServidor()`), validando o fluxo de emissão após término de atividades, cálculo de frequências, aplicação de tetos no extrato e verificação pública de códigos.

## 8. Fatias de entrega
- **Fatia 1**: Emissão de certificados (`POST /atividades/:id/certificado`, listagem `GET /certificados`), validando presença mínima (`R1`), encerramento (`R2`), formato e idempotência do código (`R3`) e papéis (`R6`).
- **Fatia 2**: Cálculo do Extrato de horas (`GET /extrato`) com somas brutas e aplicação de tetos por tipo e total (`R4`, `R6`).
- **Fatia 3**: Verificação pública de certificados (`GET /certificados/:codigo`) por código (`R5`).
