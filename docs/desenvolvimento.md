# Guia de desenvolvimento

Instruções técnicas para rodar e publicar o site. A documentação do projeto está no [README](../README.md).

## Como rodar

Precisa do Node.js 20 ou mais novo e da [API](https://github.com/clinica-consulta/clinica-backend) rodando.

```sh
npm install
npm run dev
```

O site abre em http://localhost:8080. Por padrão ele usa a API em `http://localhost:3000/api`. Para usar outra, crie um arquivo `.env` com:

```
VITE_API_URL=https://endereco-da-api/api
```

## Publicação (Vercel)

Importe este repositório na Vercel sem mudar as configurações de build e adicione a variável `VITE_API_URL` com o endereço da API publicada (por exemplo `https://clinica-senai-api.onrender.com/api`).
