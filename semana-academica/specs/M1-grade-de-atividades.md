# Spec — M1 — Grade de Atividades

## 1. Objetivo
Permitir que a organização gerencie a grade de atividades da Semana Acadêmica (palestras e minicursos), definindo salas, horários, vagas e encontros, garantindo a consistência do cronograma e a consulta pública por participantes e organizadores.

## 2. Fora de escopo
- Inscrições de participantes em atividades (tratado em M2).
- Confirmação de presença e controle de QR code (tratado em M3).
- Emissão de certificados e extrato de horas (tratado em M4).
- Painel gerencial, estatísticas e bloqueios (tratado em M5).
- Criação e alteração de usuários ou salas (dados iniciais fixos).

## 3. Modelo

### Sala
- `id`: string (fixo, ex: `auditorio`, `sala-101`)
- `nome`: string (fixo)
- `capacidade`: número inteiro (fixo)

### Atividade
- `id`: string gerada automaticamente (prefixo `atv_` + 8 hexadecimais)
- `titulo`: string (informado pelo cliente)
- `tipo`: string `"palestra" | "minicurso"` (informado pelo cliente)
- `salaId`: string (informado pelo cliente)
- `vagas`: número inteiro (informado pelo cliente)
- `encontros`: array de Encontro (informado pelo cliente)
- `cargaHorariaMinutos`: número inteiro (calculado automaticamente pela soma da duração dos encontros)
- `situacao`: string `"prevista" | "em_andamento" | "encerrada" | "cancelada"` (calculado com base no relógio)
- `ocupadas`: número inteiro (calculado)
- `vagasRestantes`: número inteiro (calculado)
- `emEspera`: número inteiro (calculado)

### Encontro
- `id`: string gerada automaticamente (prefixo `enc_` + 8 hexadecimais)
- `inicio`: string ISO 8601 com fuso (informado pelo cliente)
- `fim`: string ISO 8601 com fuso (informado pelo cliente)

## 4. Endpoints

- `GET /salas`: Retorna lista de salas (200 `[Sala]`). Aberto a todos.
- `GET /atividades`: Retorna lista de atividades, com filtros opcionais `?dia=AAAA-MM-DD` e `?tipo=palestra|minicurso` (200 `[Atividade]`). Aberto a todos.
- `GET /atividades/:id`: Retorna uma atividade específica por ID (200 `Atividade`). Aberto a todos.
- `POST /atividades`: Cria uma nova atividade (201 `Atividade`). Exclusivo para organização (`X-Usuario` com papel `organizacao`).
- `PATCH /atividades/:id`: Altera título ou vagas de uma atividade existente (200 `Atividade`). Exclusivo para organização.
- `POST /atividades/:id/cancelamento`: Cancela uma atividade (200 `Atividade`). Exclusivo para organização.

## 5. Regras

- R1 (P1, RN-102, RN-103): Palestras devem possuir exatamente 1 encontro; minicursos devem possuir de 2 a 5 encontros. Caso contrário, recusar com `422 QUANTIDADE_DE_ENCONTROS`.
- R2 (P2, RN-104, RN-105, RN-106): Cada encontro deve durar no mínimo 1 hora e no máximo 4 horas, começar e terminar no mesmo dia, estar inteiramente dentro do período do evento (19 a 23/10/2026), e os encontros de uma mesma atividade não podem se sobrepor temporalmente. Caso contrário, recusar com `422 ENCONTRO_INVALIDO`.
- R3 (P6, RN-107): A quantidade de vagas informada deve ser de no mínimo 1 e não pode ultrapassar a capacidade máxima da sala associada (`salaId`). Caso contrário, recusar com `422 VAGAS_ACIMA_DA_CAPACIDADE`.
- R4 (P3, RN-108): Na mesma sala, deve existir um intervalo mínimo de 15 minutos entre o fim de um encontro e o início do próximo encontro de outra atividade. Encontros de atividades canceladas não participam desta verificação de conflito. Caso haja conflito, recusar com `409 CONFLITO_DE_SALA`.
- R5 (P8, RN-109): A carga horária (`cargaHorariaMinutos`) é calculada automaticamente pelo sistema como a soma das durações de todos os encontros em minutos. Qualquer valor enviado pela cliente nesse campo é ignorado.
- R6 (P4, RN-110, RN-113): Após a criação da atividade, apenas os campos `titulo` e `vagas` podem ser alterados (`PATCH`). Tentativas de modificar `salaId`, `tipo` ou `encontros` devem ser recusadas com `422 CAMPO_NAO_EDITAVEL`. Se a atividade já estiver cancelada, qualquer `PATCH` é recusado com `422 ATIVIDADE_CANCELADA`, mesmo que o campo enviado fosse um dos editáveis, essa verificação vem antes da verificação do campo editável.
- R7 (P7, RN-111): Ao alterar as vagas de uma atividade, o novo valor não pode ser menor do que a quantidade de inscrições que atualmente ocupam as vagas (considerando inscrições confirmadas e convocadas. Nota: até o M2 existir, a contagem de inscrições confirmadas/convocadas é 0 [stub documentado], não uma regra nova). Caso contrário, recusar com `409 VAGAS_ABAIXO_DOS_INSCRITOS`.
- R8 (P5, RN-112, RN-113): Uma atividade só pode ser cancelada antes de seu início. Na tentativa de `POST /atividades/:id/cancelamento`, a ordem de verificação é: primeiro checar se já está cancelada  (recusar com `422 ATIVIDADE_CANCELADA`), só depois checar se já inicou (recusar com `422 ATIVIDADE_JA_INICIADA`). O cancelamento bem-sucedido é definitivo: uma atividade cancelada nunca aceita um novo cancelamento.
- R10 (P9, RN-115, RN-116): A listagem de atividades (`GET /atividades`) é ordenada pelo horário de início do primeiro encontro e, em caso de empate, pelo título. Atividades canceladas continuam aparecendo na listagem. O filtro `dia` retorna atividades que possuam algum encontro naquele dia do calendário de Brasília, podendo ser combinado com o filtro `tipo`.
- R11 (Contrato, RN-101): Restrição de Papel (`SOMENTE_ORGANIZACAO`): Somente usuários com o papel de organização podem criar, alterar ou cancelar atividades. As rotas POST /atividades, PATCH /atividades/:id e POST /atividades/:id/cancelamento são exclusivas da organização. Usuários sem esse papel devem receber 403 SOMENTE_ORGANIZACAO.
- R12 (P10, RN-114): Determinação da situação (`situacao`): A situação da atividade é calculada pelo relógio do sistema: `prevista` antes do início do primeiro encontro; `em_andamento` vale do início do 1º encontro até o fim do último (exclusive); `encerrada` a partir do fim do último (inclusive); e `cancelada` quando a atividade tiver sido cancelada, prevalecendo sobre todas.

## 6. Critérios de aceite

1. (R1) `POST /atividades` com minicurso contendo 1 encontro → 422 `QUANTIDADE_DE_ENCONTROS`.
2. (R1) `POST /atividades` com palestra contendo 2 encontros → 422 `QUANTIDADE_DE_ENCONTROS`.
3. (R2) `POST /atividades` com encontro de 30 minutos ou 5 horas → 422 `ENCONTRO_INVALIDO`.
4. (R2) `POST /atividades` com encontro fora do período 19 a 23/10/2026 ou cruzando a meia-noite → 422 `ENCONTRO_INVALIDO`.
5. (R2) `POST /atividades` com encontros sobrepostos na mesma atividade → 422 `ENCONTRO_INVALIDO`.
6. (R3) `POST /atividades` ou `PATCH /atividades/:id` definindo vagas acima da capacidade da sala (ex: 250 vagas no auditório que comporta 200, ou vagas <= 0) → 422 `VAGAS_ACIMA_DA_CAPACIDADE`.
7. (R4) `POST /atividades` com encontro na mesma sala deixando menos de 15 minutos de intervalo com outra atividade existente (não cancelada) → 409 `CONFLITO_DE_SALA`.
8. (R5) `POST /atividades` enviando `cargaHorariaMinutos` personalizado → 201 com `cargaHorariaMinutos` calculado corretamente pela soma dos encontros.
9. (R6) `PATCH /atividades/:id` alterando `salaId`, `tipo` ou `encontros` → 422 `CAMPO_NAO_EDITAVEL`.
10. (R6) `PATCH /atividades/:id` alterando `titulo` (campo editável) numa atividade já cancelada → 422 `ATIVIDADE_CANCELADA`, não 200.
11. (R6) `PATCH /atividades/:id` alterando `titulo` e `vagas` válidos → 200 `Atividade`.
12. (R7) `PATCH /atividades/:id` reduzindo vagas abaixo do total de inscrições confirmadas/convocadas (stub 0 enquanto M2 não existe) → 409 `VAGAS_ABAIXO_DOS_INSCRITOS`.
13. (R8) `POST /atividades/:id/cancelamento` em atividade que já iniciou (mas não cancelada) -> 422 `ATIVIDADE_JA_INICIADA`.
14. (R8) `POST /atividades/:id/cancelamento` em atividade já cancelada -> 422 `ATIVIDADE_CANCELADA `.
15. (R8) `POST /atividades/:id/cancelamento` em atividade que já iniciou E já está cancelada -> 422 `ATIVIDADE_CANCELADA` (prova a ordem).
16. (R10) `GET /atividades?dia=2026-10-19&tipo=minicurso` → 200 com lista ordenada por início do primeiro encontro e título, incluindo canceladas.
17. (R11) `POST /atividades`, `PATCH /atividades/:id` ou `POST /atividades/:id/cancelamento` chamados por um participante → 403 `SOMENTE_ORGANIZACAO`.
18. (R12) (P10, RN-114) Consultar atividade em diferentes instantes do relógio (`/_teste/relogio`) → `situacao` retorna corretamente `prevista`, `em_andamento` (do início do 1º encontro até o fim do último exclusive), `encerrada` (a partir do fim do último inclusive) ou `cancelada`.

## 7. Como isto será verificado
Testes automatizados via requisições HTTP (Supertest / fetch) no servidor Express (`criarServidor()`), utilizando o modo de teste com relógio controlado (`/_teste/relogio` e `/_teste/reset`) e cabeçalho `X-Usuario` para autenticação de organizadores e participantes.

## 8. Fatias de entrega
- **Fatia 1:** Consulta de salas e listagem/detalhes de atividades (`GET /salas`, `GET /atividades`, `GET /atividades/:id`, R10, R12).
- **Fatia 2:** Criação de atividades, validação de encontros, capacidade de sala, conflito de horários/salas, cálculo de carga horária e restrição de papel (`POST /atividades`, R1, R2, R3, R4, R5, R11).
- **Fatia 3:** Alteração de atividades e regras de edição/vagas (`PATCH /atividades/:id`, R6, R7, R11).
- **Fatia 4:** Cancelamento de atividades (`POST /atividades/:id/cancelamento`, R8, R11).
