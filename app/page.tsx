'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Vote,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Layers,
  MessageSquare
} from 'lucide-react';

export default function LandingPage() {
  const funcionalidades = [
    {
      icon: Vote,
      titulo: 'Sessões de Votação',
      descricao: 'Crie sessões de votação personalizadas com datas de início e fim controladas.'
    },
    {
      icon: Layers,
      titulo: 'Gestão de Projetos',
      descricao: 'Adicione projetos às suas sessões e organize as propostas de forma clara.'
    },
    {
      icon: BarChart3,
      titulo: 'Resultados em Tempo Real',
      descricao: 'Acompanhe os resultados das votações instantaneamente conforme os votos são registrados.'
    },
    {
      icon: Users,
      titulo: 'Comunidades',
      descricao: 'Crie comunidades, convide participantes e gerencie membros de forma simples.'
    }
  ];

  const passos = [
    {
      numero: '01',
      titulo: 'Crie uma sessão',
      descricao: 'Defina o título, descrição e período de votação para sua sessão.'
    },
    {
      numero: '02',
      titulo: 'Adicione projetos',
      descricao: 'Inclua os projetos ou propostas que serão votados pelos participantes.'
    },
    {
      numero: '03',
      titulo: 'Votação e resultados',
      descricao: 'Os participantes votam e você acompanha os resultados em tempo real.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">VoteCerto</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Como Funciona
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Shield className="w-3 h-3 mr-1" />
              Votação Segura e Transparente
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Decisões coletivas de forma{' '}
              <span className="text-emerald-600">simples e eficiente</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              O VoteCerto é a plataforma ideal para realizar votações, consultas e decisões
              coletivas. Segurança, transparência e resultados em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/cadastro">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto">
                  Começar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Fazer Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Funcionalidades completas para gerenciar suas votações de forma profissional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {funcionalidades.map((func, index) => (
              <Card key={index} className="border-slate-200 hover:border-slate-300 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                    <func.icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <CardTitle className="text-lg">{func.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{func.descricao}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Como funciona
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Três passos simples para realizar suas votações
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {passos.map((passo, index) => (
              <div key={index} className="relative">
                {index < passos.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-slate-200" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-white">{passo.numero}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {passo.titulo}
                  </h3>
                  <p className="text-slate-600">{passo.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Crie sua conta agora e comece a realizar votações de forma simples e segura.
          </p>
          <Link href="/auth/cadastro">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Criar Conta Gratuíta
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Vote className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">VoteCerto</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span>&copy; {new Date().getFullYear()} VoteCerto</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">v1.0.0</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
