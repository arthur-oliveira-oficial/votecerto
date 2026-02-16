import "dotenv/config";
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}
async function criarAdmin() {
  console.log('\n=== Criar Usuário ADMIN ===\n');
  const email = await ask('Email: ');
  if (!email || !email.includes('@')) {
    console.log('Email inválido!');
    return;
  }
  const password = await ask('Senha (mínimo 6 caracteres): ');
  if (!password || password.length < 6) {
    console.log('A senha deve ter pelo menos 6 caracteres!');
    return;
  }
  const nome = await ask('Nome: ');
  if (!nome) {
    console.log('Nome é obrigatório!');
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuarios.create({
      data: {
        email,
        password_hash: passwordHash,
        tipo: 'ADMIN',
        nome,
      }
    });
    console.log(`\nUsuário ADMIN criado com sucesso!`);
    console.log(`ID: ${usuario.id}`);
    console.log(`Email: ${usuario.email}`);
    console.log(`Nome: ${usuario.nome}`);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      console.log('\nErro: Email já cadastrado!');
    } else {
      console.error('\nErro ao criar usuário:', error);
    }
  }
}
criarAdmin()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    rl.close();
  });