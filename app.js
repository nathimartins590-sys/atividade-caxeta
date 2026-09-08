import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

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
 * /livros:
 *   get:
 *     summary: Lista livros
 *     description: Retorna a lista de livros, com filtro opcional por título
 *     parameters:
 *       - in: query
 *         name: titulo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra os livros pelo título
 *     responses:
 *       200:
 *         description: Lista de livros retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   autor:
 *                     type: string
 *                   disponivel:
 *                     type: boolean
 */
app.get('/livros', (req, res) =>{
    const titulo = req.query?.titulo || null
    let livrosFiltrados = null
    if(titulo !== null){
      livrosFiltrados = livros.filter(item => item.titulo.toLowerCase()
                                                    .includes(titulo.toLowerCase()));
    }

    livrosFiltrados = livrosFiltrados ?? livros;
    res.status(200).json(livrosFiltrados);
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
app.get('/livros/:id', (req, res) =>{
    const id = Number(req.params?.id);

    const livro = livros.find(item => item.id === id);

    if(!livro){
        return res.status(404).json({error: "livro não foi encontrado"})
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
 *                 example: true
 *     responses:
 *       201:
 *         description: Livro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
app.post('/livros', (req, res)=>{

    const titulo = req.body?.titulo || null;
    const autor = req.body?.autor || null;

      if(!autor){
        return res.status(400).json({error: "Autor é obrigatório"})
      }

      if(!titulo){
        return res.status(400).json({error: "Título é obrigatório"})
      }

        const novoLivro = {
            id: livros.length + 1,
            titulo : titulo,
            autor : autor,
            disponviel: req.body?.disponivel || false
        }

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
 *                 example: Memórias Póstumas de Brás Cubas
 *               autor:
 *                 type: string
 *                 example: Machado de Assis
 *               disponivel:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Livro atualizado com sucesso
 *       404:
 *         description: Livro não encontrado
 */
app.put('/livros/:id', (req, res) => {
    const id = Number(req.params.id);
    const livro = livros.find(item => item.id === id);
    if(!livro){
        return res.status(404).json({error: "Livro não foi encontrado"})
    }

    if(req?.body?.titulo && req.body.titulo !== ""){
        livro.titulo = req.body.titulo;
    }

    if(req?.body?.autor && req.body.autor !== ""){
        livro.autor = req.body.autor;
    }

    if(req?.body?.disponivel && req.body.disponivel !== ""){
        livro.disponivel = req.body.disponivel;
    }

    res.status(200).json(livro)
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
 *         description: Livros excluido com sucesso
 *       404:
 *         description: Livros não encontrado
 */
app.delete('/livros/:id', (req, res) =>{
    const id = Number(req.params.id);
    const indice = livros.findIndex(item => item.id === id)

    if(indice === -1){
        return res.status(404).json({ error: "Livro não foi encontrado" })
    }

    livros.splice(indice, 1);

    res.status(204).send('')

});

export default app;