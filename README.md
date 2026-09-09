# atividade-caxeta

# atividade-caxeta — API de Biblioteca

API REST desenvolvida em Node.js/Express para gerenciamento de uma biblioteca: cadastro de livros, empréstimos e devoluções, categorias e histórico de empréstimos.

Atividade individual de Web Services.

## Tecnologias

- Node.js + Express

- Swagger (swagger-jsdoc + swagger-ui-express) para documentação da API

- Jest + Supertest para os testes

- Persistência dos dados em arquivo JSON

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/livros` | Lista livros (filtros: `titulo`, `autor`, `disponivel`, `genero`; ordenação: `ordenar`; paginação: `pagina`, `limite`) |
| GET | `/livros/:id` | Busca um livro pelo id |
| POST | `/livros` | Cria um novo livro |
| PUT | `/livros/:id` | Atualiza um livro |
| DELETE | `/livros/:id` | Remove um livro |
| POST | `/livros/:id/emprestar` | Empresta um livro disponível |
| POST | `/livros/:id/devolver` | Devolve um livro emprestado |
| GET | `/categorias` | Lista os gêneros/categorias cadastrados |
| GET | `/emprestimos` | Lista o histórico completo de empréstimos |
| GET | `/livros/:id/emprestimos` | Lista o histórico de empréstimos de um livro específico |

## Persistência

Os dados dos livros são salvos em `data/livros.json` e recarregados automaticamente sempre que o servidor é iniciado. Toda alteração (criar, atualizar, excluir, emprestar ou devolver um livro) é salva nesse arquivo.

## Autor

Nathalia


[eu sei que ta ruim e com umas coisas esquisitas mas eu juro que tentei sor :D ]