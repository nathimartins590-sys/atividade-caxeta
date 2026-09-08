import fs from "fs";

const arquivos = ["./data/livros.test.json"];

for (const arquivo of arquivos) {
    if (fs.existsSync(arquivo)) {
        fs.unlinkSync(arquivo);
    }
}