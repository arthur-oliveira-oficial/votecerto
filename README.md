# VoteCerto

[![Licença: MIT](https://img.shields.io/badge/Licença-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

VoteCerto é uma plataforma de votação online de código aberto, construída com Next.js 16 (App Router), que permite a criação de sessões de votação com participação de diferentes tipos de usuários de forma segura e eficiente.

## Funcionalidades

- **Sistema de autenticação** - Login e cadastro com tokens JWT (validade de 7 dias)
- **Três tipos de usuários**:
  - **ADMIN** - Acesso total ao sistema
  - **GESTOR** - Gerencia comunidades e sessões de votação
  - **PARTICIPANTE** - Participa de votações em comunidades
- **Comunidades** - Criação de comunidades com código de convite para participação
- **Sessões de votação** - Criação de sessões com data de início e fim configuráveis
- **Projetos** - Propostas vinculadas a sessões de votação
- **Votação** - Um voto por sessão por participante
- **Resultados em tempo real** - Visualização dos resultados assim que votações são registradas

## Tecnologias

### Stack Principal

| Tecnologia | Versão |
|------------|--------|
| Next.js | 16.x |
| TypeScript | 5.x |
| React | 19.x |
| Prisma ORM | 7.x |
| MariaDB | 10.x+ |

### Bibliotecas e Frameworks

- **Autenticação**: [jose](https://github.com/panva/jose) (JWT)
- **Validação**: [Zod](https://github.com/colinhacks/zod) + react-hook-form
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Datas**: [date-fns](https://date-fns.org/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Cache**: [SWR](https://swr.vercel.app/)

## Pré-requisitos

- Node.js 18.x ou superior
- MariaDB 10.x ou MySQL 8.x
- npm ou yarn

## Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/votecerto.git
cd votecerto
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Conexão com o banco de dados (MariaDB/MySQL)
DATABASE_URL="mysql://usuario:senha@localhost:3306/votecerto"

# Secret para assinatura dos tokens JWT
JWT_SECRET="sua-chave-secreta-aqui-mínimo-32-caracteres"
```

4. **Configure o banco de dados**

```bash
# Gere o cliente Prisma
npm run db:generate

# Execute as migrações (crie as tabelas)
npx prisma migrate dev --name init
```

5. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Cria a build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run criar-usuario-admin` | Cria um usuário administrador |
| `npm run criar-usuario-gestor` | Cria um usuário gestor |
| `npm run criar-usuario-participante` | Cria um usuário participante |

## Estrutura do Projeto

```
votecerto/
├── app/                    # Páginas Next.js (App Router)
│   ├── api/               # API Routes (endpoints REST)
│   ├── auth/             # Páginas de autenticação
│   ├── admin/            # Dashboard do administrador
│   ├── gestor/           # Dashboard do gestor
│   └── participante/     # Área do participante
├── components/            # Componentes React
│   ├── ui/              # Componentes UI reutilizáveis
│   └── *.tsx            # Componentes específicos
├── lib/                  # Utilitários e configurações
│   ├── auth.ts          # Funções JWT
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Funções utilities
├── prisma/               # Schema do banco de dados
│   └── schema.prisma    # Modelos Prisma
├── hooks/               # Hooks React personalizados
└── scripts/             # Scripts de utilidade
```

## Modelos de Dados

O projeto utiliza os seguintes modelos no banco de dados:

- **usuarios** - Usuários do sistema com tipos (ADMIN, GESTOR, PARTICIPANTE)
- **sessoes** - Sessões de votação com datas de início/fim
- **projetos** - Propostas vinculadas a sessões
- **votos** - Registros de votos por usuário em sessões
- **comunidades** - Grupos de usuários com código de convite
- **participantes** - Relação de usuários em comunidades

## API Routes Principais

### Autenticação

- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/cadastro` - Cadastro de novo usuário

### Usuários

- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/[id]` - Obter usuário por ID
- `PUT /api/usuarios/[id]` - Atualizar usuário
- `DELETE /api/usuarios/[id]` - Excluir usuário

### Comunidades

- `GET /api/comunidades` - Listar comunidades
- `POST /api/comunidades` - Criar comunidade
- `GET /api/comunidades/[id]` - Obter comunidade
- `PUT /api/comunidades/[id]` - Atualizar comunidade
- `POST /api/comunidades/entrar` - Entrar em comunidade com código

### Sessões de Votação

- `GET /api/sessoes` - Listar sessões
- `POST /api/sessoes` - Criar sessão
- `GET /api/sessoes/[id]` - Obter sessão
- `PUT /api/sessoes/[id]` - Atualizar sessão
- `DELETE /api/sessoes/[id]` - Excluir sessão

### Projetos

- `GET /api/projetos` - Listar projetos
- `POST /api/projetos` - Criar projeto
- `GET /api/projetos/[id]` - Obter projeto
- `PUT /api/projetos/[id]` - Atualizar projeto
- `DELETE /api/projetos/[id]` - Excluir projeto

### Votos

- `POST /api/votos` - Registrar voto
- `GET /api/votos/sessao/[sessaoId]` - Listar votos de uma sessão
- `GET /api/votos/sessao/[sessaoId]/resultados` - Obter resultados de uma sessão

## Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2026 VoteCerto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

Feito com ❤️ pela comunidade VoteCerto
