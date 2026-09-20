# Entrevista M1 — Grade de Atividades

## Rodada 1

| # | Pergunta | Resposta | Fonte |
|---|---|---|---|
| P1 | Limite de encontros (`QUANTIDADE_DE_ENCONTROS`) | As palestras possuem exatamente 1 encontro. Já os minicursos possuem de 2 a 5 encontros. | RN-102 e RN-103 |
| P2 | Validação de horários e datas (`ENCONTRO_INVALIDO`) | Cada encontro deve durar no mínimo 1 hora e no máximo 4 horas. Cada encontro deve começar e terminar no mesmo dia e estar dentro do período do evento, que ocorre de 19 a 23/10/2026. Além disso, os encontros de uma mesma atividade não podem se sobrepor. | RN-104, RN-105 e RN-106 |
| P3 | Conflito de sala (`CONFLITO_DE_SALA`) | Na mesma sala deve existir um intervalo mínimo de 15 minutos entre o fim de um encontro e o início do próximo. Os encontros de atividades canceladas não entram nessa verificação. | RN-108 |
| P4 | Campos não editáveis (`CAMPO_NAO_EDITAVEL`) | Depois que a atividade é criada, somente o título e as vagas podem ser alterados. Sala, tipo e encontros não podem ser modificados. | RN-110 |
| P5 | Cancelamento de atividade (`ATIVIDADE_JA_INICIADA` / `ATIVIDADE_CANCELADA`) | Uma atividade só pode ser cancelada antes de seu início. Depois de cancelada, o cancelamento é definitivo, ela não pode ser alterada e nem cancelada novamente. | RN-112 e RN-113 |

### Perguntas Adicionais — Rodada 1

| # | Pergunta | Resposta | Fonte |
|---|---|---|---|
| P6 | Limite de vagas e capacidade da sala (`VAGAS_ACIMA_DA_CAPACIDADE`) | A quantidade de vagas deve ser de no mínimo 1 e não pode ultrapassar a capacidade máxima da sala. | RN-107 |
| P7 | Redução de vagas abaixo dos inscritos (`VAGAS_ABAIXO_DOS_INSCRITOS`) | As vagas não podem ser reduzidas para um número menor que a quantidade das inscrições que atualmente ocupam as vagas, considerando para isso inscrições confirmadas e convocadas. Quando as vagas são aumentadas, a lista de espera pode ser avançada. | RN-111 |
| P8 | Cálculo da Carga Horária (`cargaHorariaMinutos`) | A carga horária é calculada automaticamente pela soma das durações de todos os encontros, em minutos. A organização não informa esse valor, qualquer valor enviado para esse campo é ignorado. | RN-109 |
| P9 | Filtros de listagem (`GET /atividades`) | A listagem de atividades é ordenada pelo início do primeiro encontro e, em caso de empate, pelo título. Atividades canceladas continuam aparecendo. O filtro dia retorna atividades que possuam algum encontro naquele dia do calendário de Brasília e pode ser combinado com o filtro tipo. | RN-115 e RN-116 |
| P10 | Mudança de situação (`situacao`) | A situação da atividade é calculada pelo relógio do sistema. Ela é prevista antes do início do primeiro encontro, passa para `em_andamento` a partir do início do primeiro encontro, e passa para `encerrada` a partir do fim do último encontro. Se a atividade for cancelada, a situação é `cancelada`, que prevalece sobre as demais. | RN-114 |
