---
name: front-end
description: >
  Implementa as telas Vue de um módulo a partir da spec já pronta
  (specs/M{N}-*.md), seguindo o padrão visual da skill padrao-de-design.
  Use sempre que for criar as telas de um módulo (M1 a M4) — nunca antes
  da spec do módulo estar fechada e da API correspondente já ter suas
  fatias implementadas.
---

# Telas a partir da spec, não da imaginação

Uma tela não é um desenho bonito — é a spec do módulo virando interface.
Toda decisão de comportamento (o que acontece em cada erro, quando um
botão desaparece, o que o usuário vê em cada estado) já foi tomada na
spec. Esta skill não decide regra de negócio nenhuma: se uma tela
precisar de um comportamento que a spec não define, isso é um buraco —
trate como buraco (volte pro grilling daquele módulo), não invente aqui.

## Pré-requisito, sempre confira antes de começar

- `specs/M{N}-*.md` existe e está fechada (regras numeradas R1..Rn).
- A API do módulo já tem as fatias correspondentes implementadas e
  testadas — telas não esperam API que ainda não existe. Se faltar
  fatia, pare e avise, não simule o comportamento da API no componente.
- Leia `.opencode/skills/padrao-de-design/SKILL.md` antes de escrever
  qualquer componente — ele define os quatro estados (carregando, vazio,
  erro, sucesso) e a regra de proximidade do erro. Esta skill não repete
  aquilo, só aplica.

## Como conduzir

1. **Liste as telas mínimas do módulo** a partir do enunciado da
   atividade e da seção de endpoints da spec. Confirme com quem pediu
   antes de começar a codar — a lista de telas não é sua decisão sozinha.
2. **Para cada tela, uma sessão de trabalho por vez** (não misture duas
   telas na mesma leva de código): identifique quais endpoints ela
   consome, quais regras (R1..Rn) afetam o que ela mostra ou habilita, e
   quais códigos de erro (seção 6 do contrato) ela pode receber.
3. **API falsa antes de código de tela.** Toda tela nasce com uma
   versão falsa (fake/mock) da API que ela consome, respondendo nos
   mesmos formatos e códigos de erro do contrato-api.md — real nunca é
   chamada em teste. Se a fake ainda não existe para aquele endpoint,
   crie-a primeiro.
4. **Teste antes do componente**, igual a skill tdd faz para a API: para
   cada comportamento não trivial (regra de habilitar/desabilitar botão,
   erro exibido no campo certo, item some/aparece por causa da
   `situacao`), escreva o teste, mostre falhando, só então o componente.
5. **Aplique o mapeamento código→tela** da tabela de
   padrao-de-design para cada erro que a tela pode receber. Se a tabela
   não tiver a linha do código que você precisa, preencha a linha lá
   antes de codar a tela — não decida ali dentro do componente sem
   registrar.
6. **Confira contra os critérios de aceite da spec** (seção 6) que
   tocam a tela — cada um deve corresponder a um teste ou a um
   comportamento visível verificável.

## O que NÃO fazer

- Não invente estado que a spec não define (ex.: um "quase cheio" que
  não existe em nenhuma regra).
- Não chame a API real dentro de teste de componente.
- Não implemente tela de módulo cuja API ainda não tem a fatia
  correspondente pronta.
- Não decida ordem de exibição de erro sem checar a tabela de
  padrao-de-design primeiro.

## Quando está pronto

Para cada tela: os quatro estados existem, todo código de erro que a
rota pode devolver tem linha preenchida na tabela de padrao-de-design e
comportamento correspondente no componente, e todo critério de aceite da
spec que toca aquela tela tem teste ou está marcado como não aplicável
com justificativa.