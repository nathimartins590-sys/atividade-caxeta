import fs from "fs";

const CAMINHO = process.env.TEST === "true"
    ? "./data/livros.test.json"
    : "./data/livros.json";

const LIVROS_PADRAO = [
    {
        id: 1,
        titulo: "O escaravelho do diabo",
        autor: "Lucia Machado",
        disponivel: true,
        genero: "Suspense"
    },
    {
        id: 2,
        titulo: "E o vento levou",
        autor: "Erico veríssimo",
        disponivel: false,
        genero: "Romance"
    }
];

export function carregarLivros(caminho = CAMINHO) {
    if (fs.existsSync(caminho)) {
        const conteudo = fs.readFileSync(caminho, "utf-8");
        return JSON.parse(conteudo);
    }

    salvarLivros(LIVROS_PADRAO, caminho);
    return [...LIVROS_PADRAO];
}

export function salvarLivros(livros, caminho = CAMINHO) {
    fs.writeFileSync(caminho, JSON.stringify(livros, null, 2));
}