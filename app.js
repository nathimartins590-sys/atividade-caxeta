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
        disponivel: true,
        genero: "Suspense"
    },
    {
        id : 2,
        titulo: "E o vento levou",
        autor: "Erico veríssimo",
        disponivel: false,
        genero: "Romance"
    }
]

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

/**
 * @openapi
 * /livros:
 *   get:
 *     summary: Lista livros
 *     description: Retorna a lista de livros, com filtro por título, autor, disponibilidade e gênero, ordenação e paginação
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *       - in: query
 *         name: autor
 *         schema:
 *           type: string
 *       - in: query
 *         name: disponivel
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *       - in: query
 *         name: ordenar
 *         schema:
 *           type: string
 *           enum: [titulo, autor]
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso
 */
app.get('/livros', (req, res) => {
    let resultado = [...livros];
    const { titulo, autor, disponivel, genero, ordenar, pagina = 1, limite = 10 } = req.query;

    if (titulo) resultado = resultado.filter(l => l.titulo.toLowerCase().includes(titulo.toLowerCase()));
    if (autor) resultado = resultado.filter(l => l.autor.toLowerCase().includes(autor.toLowerCase()));
    if (disponivel !== undefined) resultado = resultado.filter(l => String(l.disponivel) === disponivel);
    if (genero) resultado = resultado.filter(l => l.genero === genero);

    if (ordenar === 'titulo') resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (ordenar === 'autor') resultado.sort((a, b) => a.autor.localeCompare(b.autor));

    const inicio = (Number(pagina) - 1) * Number(limite);
    const paginado = resultado.slice(inicio, inicio + Number(limite));

    res.status(200).json(paginado);
});

/**
 * @openapi
 * /livros/{id}:
 *   get:
 *     summary: Busca um livro pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro encontrado
 *       404:
 *         description: Livro não encontrado
 */
app.get('/livros/:id', (req, res) => {
    const id = Number(req.params?.id);
    const livro = livros.find(item => item.id === id);

    if (!livro) {
        return res.status(404).json({ error: "livro não foi encontrado" });
    }

    res.status(200).json(livro);
});

/**
 * @openapi
 * /livros:
 *   post:
 *     summary: Cria um novo livro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - autor
 *             properties:
 *               titulo:
 *                 type: string
 *               autor:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *               genero:
 *                 type: string
 *     responses:
 *       201:
 *         description: Livro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
app.post('/livros', (req, res) => {
    const erros = validarLivro(req.body);

    if (erros.length) {
        return res.status(400).json({ errors: erros });
    }

    const novoLivro = {
        id: livros.length + 1,
        titulo: req.body.titulo,
        autor: req.body.autor,
        disponivel: req.body?.disponivel ?? false,
        genero: req.body?.genero || null
    };

    livros.push(novoLivro);

    res.status(201).json(novoLivro);
});

/**
 * @openapi
 * /livros/{id}:
 *   put:
 *     summary: Atualiza um livro pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               autor:
 *                 type: string
 *               disponivel:
 *                 type: boolean
 *               genero:
 *                 type: string
 *     responses:
 *       200:
 *         description: Livro atualizado com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.put('/livros/:id', (req, res) => {
    const id = Number(req.params.id);
    const livro = livros.find(item => item.id === id);
    if (!livro) {
        return res.status(404).json({ error: "Livro não foi encontrado" });
    }

    if (req?.body?.titulo && req.body.titulo !== "") {
        livro.titulo = req.body.titulo;
    }

    if (req?.body?.autor && req.body.autor !== "") {
        livro.autor = req.body.autor;
    }

    if (req?.body?.disponivel !== undefined && req.body.disponivel !== "") {
        livro.disponivel = req.body.disponivel;
    }

    if (req?.body?.genero && req.body.genero !== "") {
        livro.genero = req.body.genero;
    }

    res.status(200).json(livro);
});

/**
 * @openapi
 * /livros/{id}:
 *   delete:
 *     summary: Exclui um livro pelo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Livro excluído com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.delete('/livros/:id', (req, res) => {
    const id = Number(req.params.id);
    const indice = livros.findIndex(item => item.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: "Livro não foi encontrado" });
    }

    livros.splice(indice, 1);

    res.status(204).send('');
});

/**
 * @openapi
 * /livros/{id}/emprestar:
 *   post:
 *     summary: Empresta um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
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

    emprestimos.push({
        livroId: livro.id,
        pegadoPor: req.body?.usuario || "não informado",
        dataEmprestimo: new Date().toISOString(),
        dataDevolucao: null
    });

    res.status(200).json(livro);
});

/**
 * @openapi
 * /livros/{id}/devolver:
 *   post:
 *     summary: Devolve um livro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Livro devolvido com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.post('/livros/:id/devolver', (req, res) => {
    const id = Number(req.params.id);
    const livro = livros.find(item => item.id === id);

    if (!livro) {
        return res.status(404).json({ error: "Livro não encontrado" });
    }

    livro.disponivel = true;

    const registro = emprestimos.find(e => e.livroId === id && e.dataDevolucao === null);
    if (registro) {
        registro.dataDevolucao = new Date().toISOString();
    }

    res.status(200).json(livro);
});

/**
 * @openapi
 * /categorias:
 *   get:
 *     summary: Lista os gêneros/categorias existentes
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 */
app.get('/categorias', (req, res) => {
    const generos = [...new Set(livros.map(l => l.genero).filter(Boolean))];
    res.status(200).json(generos);
});

/**
 * @openapi
 * /emprestimos:
 *   get:
 *     summary: Lista o histórico completo de empréstimos
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 */
app.get('/emprestimos', (req, res) => {
    res.status(200).json(emprestimos);
});

/**
 * @openapi
 * /livros/{id}/emprestimos:
 *   get:
 *     summary: Lista o histórico de empréstimos de um livro específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico do livro retornado com sucesso
 */
app.get('/livros/:id/emprestimos', (req, res) => {
    const id = Number(req.params.id);
    res.status(200).json(emprestimos.filter(e => e.livroId === id));
});

export default app;