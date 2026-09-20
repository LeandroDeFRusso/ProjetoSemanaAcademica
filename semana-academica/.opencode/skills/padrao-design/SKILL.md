# Skill: Padrão de Design

## Objetivo

Orientar a implementação da API utilizando separação de responsabilidades
entre Controller, Service e Repository.

## Quando utilizar

Utilize esta skill ao implementar ou modificar funcionalidades da API que
envolvam regras de negócio e acesso ao banco de dados.

## Estrutura

A implementação deve seguir o fluxo:

Controller → Service → Repository

### Controller

Responsável por:

- Receber a requisição HTTP.
- Validar a identificação básica da requisição.
- Extrair parâmetros, query parameters e corpo.
- Chamar o Service correspondente.
- Transformar o resultado em resposta HTTP.
- Retornar os códigos definidos no contrato da API.

O Controller não deve conter regras de negócio complexas.

### Service

Responsável por:

- Implementar as regras de negócio.
- Validar condições específicas da operação.
- Coordenar chamadas aos repositories.
- Determinar erros de negócio.
- Não depender diretamente de objetos HTTP como Request e Response.

### Repository

Responsável por:

- Acessar o SQLite.
- Executar consultas.
- Inserir, atualizar e remover dados.
- Retornar dados persistidos.

O Repository não deve implementar regras de negócio.

## Regras

1. Não acessar o banco diretamente a partir de Controllers.
2. Não colocar regras de negócio complexas nos Controllers.
3. Não colocar regras de negócio nos Repositories.
4. Services devem concentrar as regras de negócio.
5. Os códigos de erro devem permanecer compatíveis com `contrato-api.md`.
6. A implementação deve possuir testes automatizados.
7. Não criar abstrações sem necessidade para a funcionalidade implementada.

## Exemplo

Uma inscrição deve seguir:

POST /atividades/:id/inscricoes
        ↓
InscricaoController
        ↓
InscricaoService
        ↓
InscricaoRepository
        ↓
SQLite

O Controller recebe a requisição e chama o Service.

O Service verifica as regras de inscrição.

O Repository realiza as operações necessárias no banco.

## Testes

Os testes devem verificar as regras da funcionalidade.

Quando possível, o Service deve ser testado isoladamente das operações HTTP.

Os testes de integração devem verificar se a rota retorna os códigos e
estruturas definidos no contrato.