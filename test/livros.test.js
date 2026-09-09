import request from "supertest";
import app from "../app.js";

describe("GET /livros", () => {
  test("lista todos os livros cadastrados", async () => {
    const resposta = await request(app).get("/livros");

    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBeGreaterThanOrEqual(2);
  });

  test("filtra por título, sem diferenciar maiúsculas", async () => {
    const resposta = await request(app).get("/livros").query({ titulo: "ESCARAVELHO" });

    expect(resposta.status).toBe(200);
    expect(resposta.body[0].titulo).toBe("O escaravelho do diabo");
  });

  test("filtra por autor", async () => {
    const resposta = await request(app).get("/livros").query({ autor: "Machado" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.every(l => l.autor.toLowerCase().includes("machado"))).toBe(true);
  });

  test("filtra por disponivel", async () => {
    const resposta = await request(app).get("/livros").query({ disponivel: "false" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.every(l => l.disponivel === false)).toBe(true);
  });

  test("filtra por genero", async () => {
    const resposta = await request(app).get("/livros").query({ genero: "Romance" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.every(l => l.genero === "Romance")).toBe(true);
  });

  test("ordena por titulo", async () => {
    const resposta = await request(app).get("/livros").query({ ordenar: "titulo" });

    const titulos = resposta.body.map(l => l.titulo);
    const titulosOrdenados = [...titulos].sort((a, b) => a.localeCompare(b));

    expect(resposta.status).toBe(200);
    expect(titulos).toEqual(titulosOrdenados);
  });

  test("ordena por autor", async () => {
    const resposta = await request(app).get("/livros").query({ ordenar: "autor" });

    const autores = resposta.body.map(l => l.autor);
    const autoresOrdenados = [...autores].sort((a, b) => a.localeCompare(b));

    expect(resposta.status).toBe(200);
    expect(autores).toEqual(autoresOrdenados);
  });

  test("aplica pagina e limite", async () => {
    const resposta = await request(app).get("/livros").query({ pagina: 1, limite: 1 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBe(1);
  });

  test("retorna lista vazia quando o filtro não encontra nada", async () => {
    const resposta = await request(app).get("/livros").query({ titulo: "livro que não existe" });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });
});

describe("GET /livros/:id", () => {
  test("retorna o livro encontrado", async () => {
    const resposta = await request(app).get("/livros/1");

    expect(resposta.status).toBe(200);
    expect(resposta.body.id).toBe(1);
  });

  test("retorna erro quando o livro não existe", async () => {
    const resposta = await request(app).get("/livros/999");

    expect(resposta.status).toBe(404);
  });
});

describe("POST /livros", () => {
  test("cria um novo livro", async () => {
    const resposta = await request(app)
      .post("/livros")
      .send({ titulo: "Drácula", autor: "Bram Stoker", genero: "Terror" });

    expect(resposta.status).toBe(201);
    expect(resposta.body.titulo).toBe("Drácula");
    expect(resposta.body.disponivel).toBe(false);
  });

  test("aceita disponivel informado como true", async () => {
    const resposta = await request(app)
      .post("/livros")
      .send({ titulo: "Livro disponível", autor: "Autor Teste", disponivel: true });

    expect(resposta.status).toBe(201);
    expect(resposta.body.disponivel).toBe(true);
  });

  test("retorna erro quando o título não é informado", async () => {
    const resposta = await request(app).post("/livros").send({ autor: "Autor sem título" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("Título é obrigatório");
  });

  test("retorna erro quando o autor não é informado", async () => {
    const resposta = await request(app).post("/livros").send({ titulo: "Sem autor" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("Autor é obrigatório");
  });

  test("retorna erro quando o título passa do tamanho máximo", async () => {
    const tituloGigante = "a".repeat(201);
    const resposta = await request(app)
      .post("/livros")
      .send({ titulo: tituloGigante, autor: "Autor Teste" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("Título muito longo (máx 200 caracteres)");
  });

  test("retorna erro quando o autor passa do tamanho máximo", async () => {
    const autorGigante = "a".repeat(101);
    const resposta = await request(app)
      .post("/livros")
      .send({ titulo: "Livro Teste", autor: autorGigante });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("Autor muito longo (máx 100 caracteres)");
  });

  test("retorna erro quando disponivel não é booleano", async () => {
    const resposta = await request(app)
      .post("/livros")
      .send({ titulo: "Livro Teste", autor: "Autor Teste", disponivel: "sim" });

    expect(resposta.status).toBe(400);
    expect(resposta.body.errors).toContain("Campo 'disponivel' deve ser booleano");
  });
});

describe("PUT /livros/:id", () => {
  test("atualiza os campos informados", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Original", autor: "Autor Original", disponivel: true });

    const resposta = await request(app)
      .put(`/livros/${criado.body.id}`)
      .send({ titulo: "Atualizado", autor: "Novo Autor", disponivel: false });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      titulo: "Atualizado",
      autor: "Novo Autor",
      disponivel: false
    });
  });

  test("preserva os campos quando recebem string vazia", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Mantido", autor: "Autor Mantido" });

    const resposta = await request(app)
      .put(`/livros/${criado.body.id}`)
      .send({ titulo: "", autor: "" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.titulo).toBe("Mantido");
    expect(resposta.body.autor).toBe("Autor Mantido");
  });

  test("atualiza o genero quando informado", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro sem genero", autor: "Autor" });

    const resposta = await request(app)
      .put(`/livros/${criado.body.id}`)
      .send({ genero: "Ficção" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.genero).toBe("Ficção");
  });

  test("retorna erro quando o livro não existe", async () => {
    const resposta = await request(app).put("/livros/999").send({ titulo: "Título" });

    expect(resposta.status).toBe(404);
  });
});

describe("DELETE /livros/:id", () => {
  test("remove o livro encontrado", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro descartável", autor: "Autor" });

    const resposta = await request(app).delete(`/livros/${criado.body.id}`);

    expect(resposta.status).toBe(204);

    const busca = await request(app).get(`/livros/${criado.body.id}`);
    expect(busca.status).toBe(404);
  });

  test("retorna erro quando o livro não existe", async () => {
    const resposta = await request(app).delete("/livros/999");

    expect(resposta.status).toBe(404);
  });
});

describe("POST /livros/:id/emprestar e /devolver", () => {
  test("empresta um livro disponível", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro para emprestar", autor: "Autor", disponivel: true });

    const resposta = await request(app)
      .post(`/livros/${criado.body.id}/emprestar`)
      .send({ usuario: "Nathalia" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.disponivel).toBe(false);
  });

  test("não permite emprestar um livro indisponível", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro indisponível", autor: "Autor", disponivel: false });

    const resposta = await request(app).post(`/livros/${criado.body.id}/emprestar`);

    expect(resposta.status).toBe(400);
  });

  test("retorna erro ao emprestar livro inexistente", async () => {
    const resposta = await request(app).post("/livros/999/emprestar");

    expect(resposta.status).toBe(404);
  });

  test("devolve um livro emprestado", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro para devolver", autor: "Autor", disponivel: true });

    await request(app).post(`/livros/${criado.body.id}/emprestar`).send({ usuario: "Nathalia" });
    const resposta = await request(app).post(`/livros/${criado.body.id}/devolver`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.disponivel).toBe(true);
  });

  test("retorna erro ao devolver livro inexistente", async () => {
    const resposta = await request(app).post("/livros/999/devolver");

    expect(resposta.status).toBe(404);
  });

  test("empresta sem informar usuario e usa o valor padrão", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro sem usuario", autor: "Autor", disponivel: true });

    await request(app).post(`/livros/${criado.body.id}/emprestar`);

    const historico = await request(app).get(`/livros/${criado.body.id}/emprestimos`);
    expect(historico.body[0].pegadoPor).toBe("não informado");
  });

  test("devolve um livro que não tinha empréstimo em aberto sem quebrar", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro nunca emprestado", autor: "Autor", disponivel: false });

    const resposta = await request(app).post(`/livros/${criado.body.id}/devolver`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.disponivel).toBe(true);
  });
});

describe("GET /categorias", () => {
  test("lista os gêneros já cadastrados", async () => {
    const resposta = await request(app).get("/categorias");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toContain("Suspense");
    expect(resposta.body).toContain("Romance");
  });
});

describe("GET /emprestimos", () => {
  test("lista o histórico completo de empréstimos", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro do histórico", autor: "Autor", disponivel: true });

    await request(app).post(`/livros/${criado.body.id}/emprestar`).send({ usuario: "Nathalia" });

    const resposta = await request(app).get("/emprestimos");

    expect(resposta.status).toBe(200);
    expect(resposta.body.some(e => e.livroId === criado.body.id)).toBe(true);
  });

  test("lista o histórico de empréstimos de um livro específico", async () => {
    const criado = await request(app)
      .post("/livros")
      .send({ titulo: "Livro do histórico individual", autor: "Autor", disponivel: true });

    await request(app).post(`/livros/${criado.body.id}/emprestar`).send({ usuario: "Nathalia" });

    const resposta = await request(app).get(`/livros/${criado.body.id}/emprestimos`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBe(1);
    expect(resposta.body[0].pegadoPor).toBe("Nathalia");
  });
});