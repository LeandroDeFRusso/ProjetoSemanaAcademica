# Relatório de Auditoria: M1 - Grade de Atividades

## Matriz de Rastreabilidade

| Regra | Origem | Teste que comprova | Veredito |
|---|---|---|---|
| R1 | P1 | pi/verificacoes/m1-fatia2.spec.js:37, 69 | COMPROVADA |
| R2 | P2 | pi/verificacoes/m1-fatia2.spec.js:102, 134, 281, 313, 345 | COMPROVADA |
| R3 | P6 | pi/verificacoes/m1-fatia2.spec.js:166, 378, pi/verificacoes/m1-fatia3.spec.js:120 | COMPROVADA |
| R4 | P3 | pi/verificacoes/m1-fatia2.spec.js:198, 410 | COMPROVADA |
| R5 | P8 | pi/verificacoes/m1-fatia2.spec.js:246 | COMPROVADA |
| R6 | P4 | pi/verificacoes/m1-fatia3.spec.js:43, 81, 158, 196, pi/verificacoes/m1-atualizacoes.spec.js:5 | COMPROVADA |
| R7 | P7 | — | SEM PROVA |
| R8 | P5 | pi/verificacoes/m1-fatia4.spec.js:39, 73, 113, 147, pi/verificacoes/m1-atualizacoes.spec.js:42, 82, 115 | COMPROVADA |
| R10 | P9 | pi/verificacoes/m1-fatia1.spec.js:28, 128 | COMPROVADA |
| R11 | Contrato (RN-101) / contrato-api.md §5 (restrição pública conhecida, conforme observação) | pi/verificacoes/m1-fatia2.spec.js:5, pi/verificacoes/m1-fatia3.spec.js:5, pi/verificacoes/m1-fatia4.spec.js:5 | COMPROVADA |
| R12 | P10 | pi/verificacoes/m1-fatia1.spec.js:28, pi/verificacoes/m1-atualizacoes.spec.js:155 | COMPROVADA |

## Suíte


pm test (em pi/) → 32 testes executados com sucesso (pass: 32, ail: 0).

## Achados

1. **[SEM PROVA] R7** — a regra descrita em specs/M1-grade-de-atividades.md:55 exige recusa com 409 VAGAS_ABAIXO_DOS_INSCRITOS ao reduzir vagas abaixo da quantidade de inscrições, mas nenhum teste automatizado em pi/verificacoes/ executa ou valida este cenário. Cenário que expõe: tentativa de reduzir as vagas de uma atividade para valor inferior ao número de inscrições confirmadas/convocadas.

## Veredito

O módulo M1 não pode ser aceito até que se implemente o teste automatizado para R7 (409 VAGAS_ABAIXO_DOS_INSCRITOS).
