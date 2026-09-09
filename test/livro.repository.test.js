import fs from "fs";
import { carregarLivros, salvarLivros } from "../repository/livro.js";

const CAMINHO_TESTE = "./data/livro-repository.test.json";

afterAll(() => {
  if (fs.existsSync(CAMINHO_TESTE)) {
    fs.unlinkSync(CAMINHO_TESTE);
  }
});

describe("repository/livro.js", () => {
  test("cria o arquivo com os livros padrão quando ele ainda não existe", () => {
    if (fs.existsSync(CAMINHO_TESTE)) fs.unlinkSync(CAMINHO_TESTE);

    const livros = carregarLivros(CAMINHO_TESTE);

    expect(fs.existsSync(CAMINHO_TESTE)).toBe(true);
    expect(livros.length).toBe(2);
  });

  test("salva e depois carrega os livros do arquivo já existente", () => {
    const livrosTeste = [
      { id: 1, titulo: "Livro Salvo", autor: "Autor Salvo", disponivel: true, genero: "Teste" }
    ];

    salvarLivros(livrosTeste, CAMINHO_TESTE);
    const livrosCarregados = carregarLivros(CAMINHO_TESTE);

    expect(livrosCarregados).toEqual(livrosTeste);
  });
});