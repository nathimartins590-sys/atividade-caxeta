import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import emprestimos from "./repository/emprestimo.js";

const app = express();

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const livros = [
    {
        id : 1,
        titulo: "O escaravelho do diabo",
        autor: "Lucia Machado",
        disponivel: true
    },
    {
        id : 2,
        titulo: "E o vento levou",
        autor: "Erico veríssimo",
        disponivel: false
    }
]

/**
 * @openapi
 * /livros/{id}/emprestar:
 *   post:
 *     summary: Empresta um livro
 *     responses:
 *       200:
 *         description: Livro emprestado com sucesso
 *       400:
 *         description: Livro indisponível
 *       404:
 *         description: Livro não encontrado
 */
app.post('/livros/:id/emprestar', (req, res) => {
    const id = Number(req.params.id);
    const livro = livros.find(item => item.id === id);

    if (!livro) {
        return res.status(404).json({ error: "Livro não encontrado" });
    }

    if (!livro.disponivel) {
        return res.status(400).json({ error: "Livro indisponível para empréstimo" });
    }

    livro.disponivel = false;
    res.status(200).json(livro);
});

app.post('/livros/:id/devolver', (req, res) => {
    const id = Number(req.params.id);
    const livro = livros.find(item => item.id === id);

    if (!livro) {
        return res.status(404).json({ error: "Livro não encontrado" });
    }

    livro.disponivel = true;
    res.status(200).json(livro);
});

function validarLivro(body) {
    const erros = [];
    if (!body.titulo || body.titulo.trim() === "") erros.push("Título é obrigatório");
    if (body.titulo && body.titulo.length > 200) erros.push("Título muito longo (máx 200 caracteres)");
    if (!body.autor || body.autor.trim() === "") erros.push("Autor é obrigatório");
    if (body.autor && body.autor.length > 100) erros.push("Autor muito longo (máx 100 caracteres)");
    if (body.disponivel !== undefined && typeof body.disponivel !== "boolean") {
        erros.push("Campo 'disponivel' deve ser booleano");
    }
    return erros;
}

app.get('/livros', (req, res) => {
    let resultado = [...livros];
    const { titulo, autor, disponivel, ordenar, pagina = 1, limite = 10 } = req.query;

    if (titulo) resultado = resultado.filter(l => l.titulo.toLowerCase().includes(titulo.toLowerCase()));
    if (autor) resultado = resultado.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));
    if (disponivel !== undefined) resultado = resultado.filter(l => String(l.disponivel) === disponivel);

    if (ordenar === 'titulo') resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (ordenar === 'autor') resultado.sort((a, b) => a.autor.localeCompare(b.autor));

    const inicio = (Number(pagina) - 1) * Number(limite);
    const paginado = resultado.slice(inicio, inicio + Number(limite));

    res.status(200).json(paginado);
});

app.get('/categorias', (req, res) => {
    const generos = [...new Set(livros.map(l => l.genero).filter(Boolean))];
    res.status(200).json(generos);
});

let emprestimos = [];

emprestimos.push({
    livroId: livro.id,
    pegadoPor: req.body.usuario || "não informado",
    dataEmprestimo: new Date().toISOString(),
    dataDevolucao: null
});

app.get('/emprestimos', (req, res) => {
    res.status(200).json(emprestimos);
});

app.get('/livros/:id/emprestimos', (req, res) => {
    const id = Number(req.params.id);
    res.status(200).json(emprestimos.filter(e => e.livroId === id));
});

export default app;