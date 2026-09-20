O auditor concluiu a auditoria do módulo M1 contra specs/M1-grade-de-atividades.md. Segue o parecer completo:
Matriz de Rastreabilidade
Regra    Origem    Teste que comprova
R1    P1    api/verificacoes/m1-fatia2.spec.js:37 & 69
R2    P2    api/verificacoes/m1-fatia2.spec.js:102 & 134
R3    P6    api/verificacoes/m1-fatia2.spec.js:166
R4    P3    api/verificacoes/m1-fatia2.spec.js:198
R5    P8    api/verificacoes/m1-fatia2.spec.js:246
R6    P4    api/verificacoes/m1-fatia3.spec.js:43, 81 e api/verificacoes/m1-atualizacoes.spec.js:5
R7    P7    —
R8    P5    api/verificacoes/m1-fatia4.spec.js:39, 73, 113, 147 e api/verificacoes/m1-atualizacoes.spec.js:42, 82, 115
R10    P9    api/verificacoes/m1-fatia1.spec.js:28
R11    Contrato, RN-101    api/verificacoes/m1-fatia2.spec.js:5, api/verificacoes/m1-fatia3.spec.js:5, api/verificacoes/m1-fatia4.spec.js:5
R12    P10    api/verificacoes/m1-fatia1.spec.js:28 e api/verificacoes/m1-atualizacoes.spec.js:155
Execução dos Testes
23 testes executados com sucesso (pass: 23, fail: 0).
Achados
1. SEM ORIGEM R11 — a spec em specs/M1-grade-de-atividades.md:58 aponta Contrato, RN-101 como origem, o qual não corresponde a nenhuma pergunta P-xx listada na tabela da entrevista em entrevistas/M1-grade-de-atividades.md.
2. SEM PROVA R7 — a regra descrita em specs/M1-grade-de-atividades.md:55 exige recusa com 409 VAGAS_ABAIXO_DOS_INSCRITOS ao reduzir vagas abaixo da quantidade de inscrições, mas nenhum teste automatizado em api/verificacoes/ valida este cenário.
3. SEM PROVA R2, R3, R4, R6, R10 — cobertura parcial de subcenários especificados (conforme detalhado na matriz).
Veredito
O módulo M1 não pode ser aceito até que se atribua origem por pergunta da entrevista (P-xx) para R11, implemente-se o teste automatizado para R7 e cubram-se os subcenários pendentes de R2, R3, R4, R6 e R10.

