// livros.test.js
import request from "supertest";
import app from "../app.js";

test("POST /livros cria um novo livro", async () => {
  const resposta = await request(app).post("/livros")
    .send({ titulo: "Drácula", autor: " Bram Stoker" });

  expect(resposta.status).toBe(201);
  expect(resposta.body.titulo).toBe("Drácula");
});

test("POST /livros retorna erro ao não informar o autor", async () => {
  const resposta = await request(app).post("/livros")
    .send({ titulo: "Drácula" });

  expect(resposta.status).toBe(400);
  expect(resposta.body.error).toBe("Autor é obrigatório");
});


test("GET /livros  filtra livros pelo título", async () => {
  const resposta = await request(app).get("/livros")
    .send("titulo=escaravelho");

  expect(resposta.status).toBe(200);
  expect(resposta.body[0].titulo).toBe("O escaravelho do diabo");
});

test("GET /livros dois livros já cadastrados", async () => {
  const resposta = await request(app).get("/livros")
    .send();

  expect(resposta.status).toBe(200);
  expect(resposta.body.length).toBe(3);
});

test("GET /livros filtra por título sem diferenciar maiúsculas", async () => {
  const resposta = await request(app).get("/livros")
    .query({ titulo: "DRÁCULA" });

  expect(resposta.status).toBe(200);
  expect(resposta.body).toHaveLength(1);
  expect(resposta.body[0].titulo).toBe("Drácula");
});

test("GET /livros retorna lista vazia quando não encontra o título", async () => {
  const resposta = await request(app).get("/livros")
    .query({ titulo: "livro inexistente" });

  expect(resposta.status).toBe(200);
  expect(resposta.body).toEqual([]);
});

test("GET /livros/:id retorna o livro encontrado", async () => {
  const resposta = await request(app).get("/livros/1");

  expect(resposta.status).toBe(200);
  expect(resposta.body.id).toBe(1);
});

test("GET /livros/:id retorna erro quando o livro não existe", async () => {
  const resposta = await request(app).get("/livros/999");

  expect(resposta.status).toBe(404);
  expect(resposta.body).toEqual({ error: "livro não foi encontrado" });
});

test("POST /livros retorna erro quando o título não é informado", async () => {
  const resposta = await request(app).post("/livros")
    .send({ autor: "Autor sem título" });

  expect(resposta.status).toBe(400);
  expect(resposta.body.error).toBe("Título é obrigatório");
});

test("POST /livros aceita disponibilidade informada", async () => {
  const resposta = await request(app).post("/livros")
    .send({ titulo: "Livro disponível", autor: "Autor", disponivel: true });

  expect(resposta.status).toBe(201);
  expect(resposta.body.disponviel).toBe(true);
});

test("POST /livros usa indisponibilidade quando ela não é informada", async () => {
  const resposta = await request(app).post("/livros")
    .send({ titulo: "Livro sem disponibilidade", autor: "Autor", disponivel: false });

  expect(resposta.status).toBe(201);
  expect(resposta.body.disponviel).toBe(false);
});

test("PUT /livros/:id atualiza os campos informados", async () => {
  const resposta = await request(app).put("/livros/1")
    .send({ titulo: "Título atualizado", autor: "Novo autor", disponivel: true });

  expect(resposta.status).toBe(200);
  expect(resposta.body).toMatchObject({
    id: 1,
    titulo: "Título atualizado",
    autor: "Novo autor",
    disponivel: true
  });
});

test("PUT /livros/:id preserva os campos quando recebem valores vazios ou falsos", async () => {
  const resposta = await request(app).put("/livros/1")
    .send({ titulo: "", autor: "", disponivel: false });

  expect(resposta.status).toBe(200);
  expect(resposta.body).toMatchObject({
    titulo: "Título atualizado",
    autor: "Novo autor",
    disponivel: true
  });
});

test("PUT /livros/:id retorna erro quando o livro não existe", async () => {
  const resposta = await request(app).put("/livros/999")
    .send({ titulo: "Título" });

  expect(resposta.status).toBe(404);
  expect(resposta.body).toEqual({ error: "Livro não encontrado" });
});

test("DELETE /livros/:id remove o livro encontrado", async () => {
  const resposta = await request(app).delete("/livros/4");

  expect(resposta.status).toBe(204);
  expect(resposta.body).toEqual({});
});

test("DELETE /livros/:id retorna erro quando o livro não existe", async () => {
  const resposta = await request(app).delete("/livros/999");

  expect(resposta.status).toBe(404);
  expect(resposta.body).toEqual({ error: "Livro não foi encontrado" });
});