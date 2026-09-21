# Spec — M2 — Inscrições e Lista de Espera

## 1. Objetivo
Permitir que participantes realizem e gerenciem suas inscrições em atividades (palestras e minicursos) da Semana Acadêmica, controlando vagas, filas de espera, janelas de inscrição, conflitos de horário e limites de minicursos.

## 2. Fora de escopo
- Gestão e criação de atividades e salas (tratado em M1).
- Confirmação de presença e controle de QR code (tratado em M3).
- Emissão de certificados e extrato de horas (tratado em M4).
- Painel gerencial, estatísticas e bloqueios por faltas (tratado em M5).

## 3. Modelo

### Inscrição
- `id`: string gerada automaticamente (prefixo `ins_` + 8 hexadecimais)
- `atividadeId`: string (identificador da atividade)
- `participanteId`: string (identificador do participante)
- `status`: string `"confirmada" | "em_espera" | "convocada" | "cancelada" | "expirada"` (calculado/gerado pelo sistema)
- `posicaoNaEspera`: número inteiro ou `null` (posição na fila de espera, preenchido apenas quando `em_espera`)
- `convocadaAte`: string ISO 8601 ou `null` (prazo limite de confirmação, preenchido apenas quando `convocada`)
- `criadaEm`: string ISO 8601 (momento da criação da inscrição)

## 4. Endpoints

- `POST /atividades/:id/inscricoes`: Realiza inscrição em uma atividade (201 `Inscricao`). Exclusivo para participantes (`X-Usuario` com papel `participante`).
- `GET /inscricoes`: Retorna lista de inscrições do participante autenticado, com filtro opcional `?atividadeId=` (200 `[Inscricao]`). Aberto a todos os usuários (participante recebe apenas as próprias).
- `GET /inscricoes/:id`: Retorna detalhes de uma inscrição específica (200 `Inscricao`). Aberto a todos (retorna 404 se pertencer a outro participante).
- `POST /inscricoes/:id/cancelamento`: Cancela uma inscrição ativa (200 `Inscricao`). Exclusivo para participantes (apenas as próprias).
- `POST /inscricoes/:id/confirmacao`: Confirma uma inscrição convocada da lista de espera (200 `Inscricao`). Exclusivo para participantes (apenas as próprias).

## 5. Regras

- R1 (P1, RN-202): As inscrições fecham exatamente 30 minutos antes do início do primeiro encontro da atividade. Tentativas de inscrição (`POST /atividades/:id/inscricoes`) após esse momento devem ser recusadas com `422 INSCRICOES_ENCERRADAS`. Atividades canceladas (`atividade.situacao === 'cancelada'`) também impedem novas inscrições, retornando `422 ATIVIDADE_CANCELADA` (verificação da atividade cancelada prevalece sobre o encerramento).
- R2 (P7, RN-204, RN-218): O participante não pode ter inscrição ativa duplicada para a mesma atividade. Consideram-se ativas as inscrições nos status `"confirmada"`, `"em_espera"` ou `"convocada"`. Inscrições `"cancelada"` ou `"expirada"` não contam como ativas e não impedem nova inscrição. Tentativa de nova inscrição com inscrição ativa existente deve ser recusada com `409 JA_INSCRITO`. Além disso, o participante só pode consultar (`GET /inscricoes/:id`) e alterar (`POST /inscricoes/:id/cancelamento`, `POST /inscricoes/:id/confirmacao`) as próprias inscrições; tentativa de acessar inscrição de outro participante deve responder `404 NAO_ENCONTRADO` (e não 403).
- R3 (P2, RN-205, RN-216): Distribuição de vagas e lista de espera: Havendo vaga disponível na atividade (`ocupadas < vagas`), a inscrição é criada com status `"confirmada"` e `posicaoNaEspera: null`. Quando não há vaga (`ocupadas >= vagas`), a inscrição é criada com status `"em_espera"`, entrando no fim da fila com a respectiva `posicaoNaEspera` (1 para o primeiro na espera, 2 para o segundo, etc.). A lotação da atividade no momento da inscrição não gera erro, resultando em entrada na lista de espera. A ordem da lista de espera segue rigorosamente a ordem de chegada.
- R4 (P3, RN-206): Conflito de horário (`CONFLITO_DE_HORARIO`): O conflito de horário é verificado somente quando a inscrição ocupa vaga (`status` igual a `"confirmada"` ou `"convocada"`). Inscrições com status `"em_espera"` não ocupam vaga e não participam dessa verificação. Há conflito quando os horários dos encontros de duas atividades se sobrepõem. Horários que apenas encostam (ex: atividade A das 10:00 às 12:00 e atividade B das 12:00 às 14:00) não são considerados conflito e podem ser ocupadas pelo mesmo participante. Caso haja conflito ao tentar ocupar vaga (inscrição direta com vaga ou confirmação de convocação), recusar com `409 CONFLITO_DE_HORARIO`.
- R5 (P4, RN-207): Limite de minicursos (`LIMITE_DE_MINICURSOS`): O participante pode ter no máximo 3 minicursos ocupando vaga simultaneamente. Contam para este limite as inscrições nos status `"confirmada"` e `"convocada"`. Inscrições `"em_espera"` não contam, e palestras não entram no limite. Ao tentar realizar uma inscrição direta ou confirmar uma convocação que faria o participante ocupar vaga em um 4.º minicurso, a operação deve ser recusada com `422 LIMITE_DE_MINICURSOS`.
- R6 (P5, RN-211, RN-212, RN-213): Convocação da lista de espera: Quando uma vaga é liberada por cancelamento de inscrição, expiração de convocação ou aumento da capacidade da atividade, o primeiro participante da lista de espera deve ser automaticamente convocado (status passa para "convocada"), recebendo um prazo de 2 horas para confirmar a inscrição. O campo convocadaAte deve registrar esse prazo, mas nunca pode ultrapassar o momento de fechamento das inscrições (30 minutos antes do primeiro encontro). Se a vaga for liberada após o fechamento das inscrições, nenhum participante da espera é convocado. Quando uma convocação vence sem confirmação, a inscrição passa para o status "expirada", sai da fila e o próximo participante é convocado automaticamente em cascata, mesmo sem acesso ou consulta ao sistema. O prazo (convocadaAte) do próximo convocado é contado a partir do vencimento exato da convocação anterior.
- R7 (P5, RN-214, RN-215): Confirmação de convocação (POST /inscricoes/:id/confirmacao): Para confirmar uma convocação, a inscrição deve estar com status "convocada". Caso não esteja convocada, a operação deve ser recusada com 422 SEM_CONVOCACAO. Se a confirmação ocorrer após o momento indicado por convocadaAte, a operação deve ser recusada com 422 CONVOCACAO_EXPIRADA. Durante o prazo de convocação, a confirmação deve reavaliar as regras de conflito de horário e limite de minicursos. Caso uma dessas regras impeça a confirmação, a operação deve ser recusada com o respectivo erro, mas a convocação permanece válida até convocadaAte. Sendo bem-sucedida, a inscrição passa para o status "confirmada", e posicaoNaEspera e convocadaAte tornam-se null.
- R8 (P6, RN-209, RN-210): Cancelamento de inscrição (`POST /inscricoes/:id/cancelamento`): O participante pode cancelar a própria inscrição até o início da atividade. Se a atividade já tiver começado (`atividade.situacao` em andamento/encerrada), o cancelamento é recusado com `422 ATIVIDADE_JA_INICIADA`. Uma inscrição que já esteja nos status `"cancelada"` ou `"expirada"` é considerada inativa e não pode ser cancelada novamente, retornando `422 INSCRICAO_INATIVA` (a verificação de inscrição inativa/já cancelada/expirada tem precedência sobre a atividade já iniciada). O cancelamento de inscrição ativa (confirmada ou convocada) libera imediatamente a vaga e aciona a convocação do próximo da fila de espera.
- R9 (Contrato, RN-201): Restrição de Papel (`SOMENTE_PARTICIPANTE`): As rotas de criação de inscrição (`POST /atividades/:id/inscricoes`), cancelamento (`POST /inscricoes/:id/cancelamento`) e confirmação (`POST /inscricoes/:id/confirmacao`) são exclusivas para usuários com o papel de `participante`. Usuários da organização ou sem papel adequado devem receber `403 SOMENTE_PARTICIPANTE`.

## 6. Critérios de aceite

1. (R1) `POST /atividades/:id/inscricoes` realizada 29 minutos antes do início do primeiro encontro → `422 INSCRICOES_ENCERRADAS`.
2. (R1) `POST /atividades/:id/inscricoes` em atividade cancelada → `422 ATIVIDADE_CANCELADA`.
3. (R2) `POST /atividades/:id/inscricoes` quando o participante já possui inscrição ativa (`confirmada`, `em_espera` ou `convocada`) na mesma atividade → `409 JA_INSCRITO`.
4. (R2) `POST /atividades/:id/inscricoes` quando a inscrição anterior estava cancelada ou expirada → `201` (nova inscrição permitida).
5. (R2) `GET /inscricoes/:id` ou `POST /inscricoes/:id/cancelamento` para inscrição de outro participante → `404 NAO_ENCONTRADO`.
6. (R3) `POST /atividades/:id/inscricoes` com vagas disponíveis → `201` com status `"confirmada"` e `posicaoNaEspera: null`.
7. (R3) `POST /atividades/:id/inscricoes` sem vagas disponíveis → `201` com status `"em_espera"` e `posicaoNaEspera` correspondente (1, 2, ...).
8. (R4) `POST /atividades/:id/inscricoes` ou `POST /inscricoes/:id/confirmacao` ocupando vaga com sobreposição de horário com outra atividade confirmada/convocada → `409 CONFLITO_DE_HORARIO`.
9. (R4) Inscrições em horários que apenas encostam (ex: 10:00-12:00 e 12:00-14:00) → permitidas sem conflito.
10. (R5) `POST /atividades/:id/inscricoes` ou `POST /inscricoes/:id/confirmacao` que faria o participante ocupar vaga em um 4.º minicurso → `422 LIMITE_DE_MINICURSOS`.
11. (R5) Inscrições em minicursos em espera (`em_espera`) ou palestras não contam para o limite de minicursos.
12. (R6, R7) Liberação de vaga convoca automaticamente o 1.º da fila com prazo de 2 horas (`convocadaAte`), respeitando o limite de fechamento das inscrições.
13. (R7) `POST /inscricoes/:id/confirmacao` em inscrição sem convocação ou com convocação expirada (`convocadaAte` vencida) → `422 SEM_CONVOCACAO` ou `422 CONVOCACAO_EXPIRADA`.
14. (R7) `POST /inscricoes/:id/confirmacao` válida → `200` com status `"confirmada"`.
15. (R8) `POST /inscricoes/:id/cancelamento` após o início da atividade → `422 ATIVIDADE_JA_INICIADA`.
16. (R8) `POST /inscricoes/:id/cancelamento` em inscrição já cancelada ou expirada → `422 INSCRICAO_INATIVA`.
17. (R9) Chamada de rotas de inscrição, confirmação ou cancelamento por usuário da organização (`X-Usuario: org-ana`) → `403 SOMENTE_PARTICIPANTE`.

## 7. Como isto será verificado
Testes automatizados via requisições HTTP (Supertest / fetch) no servidor Express (`criarServidor()`), utilizando o modo de teste com relógio controlado (`/_teste/relogio` e `/_teste/reset`) para simular o avanço do tempo, expiração de convocações, janelas de inscrição e início de atividades.

## 8. Fatias de entrega
- **Fatia 1:** Inscrição direta (com vaga e em espera), listagem, detalhes, restrição de papel, verificação de duplicidade e janela de inscrições (`POST /atividades/:id/inscricoes`, `GET /inscricoes`, `GET /inscricoes/:id`, R1, R2, R3, R9).
- **Fatia 2:** Conflito de horário e limite de minicursos para inscrições diretas (`R4`, `R5`).
- **Fatia 3:** Cancelamento de inscrições e liberação de vagas (`POST /inscricoes/:id/cancelamento`, `R8`).
- **Fatia 4:** Sistema de lista de espera, convocação automática, expiração em cascata e confirmação de convocação (`POST /inscricoes/:id/confirmacao`, `R6`, `R7`).
