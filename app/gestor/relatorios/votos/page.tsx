/**
 * Página de relatório de votos
 * Exibe votos por sessão e projeto com nome, hora e CPF mascarado
 * Acesso: Gestor
 */

'use client';
import { useState } from 'react';
import { Header } from '@/components/header';
import { useRelatorioVotos, type SessaoRelatorio, type ProjetoRelatorio } from '@/hooks/useRelatorioVotos';
import { useSessoes } from '@/hooks/useSessoes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Clock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

function formatarHora(dataVoto: string): string {
  const date = new Date(dataVoto);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarData(dataVoto: string): string {
  const date = new Date(dataVoto);
  return date.toLocaleDateString('pt-BR');
}

function TabelaVotosProjeto({ projeto }: { projeto: ProjetoRelatorio }) {
  if (projeto.votos.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        Nenhum voto registrado para este projeto
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participante</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Hora do Voto</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Comentário</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projeto.votos.map((voto) => (
          <TableRow key={voto.id}>
            <TableCell className="font-medium">
              {voto.nomeParticipante}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{voto.cpfMascarado}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {formatarHora(voto.dataVoto)}
              </div>
            </TableCell>
            <TableCell>{formatarData(voto.dataVoto)}</TableCell>
            <TableCell className="max-w-xs truncate">
              {voto.comentario || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function exportarParaExcel(sessao: SessaoRelatorio) {
  const dados: Array<{
    Sessão: string;
    Projeto: string;
    'Projeto Descrição': string;
    Participante: string;
    CPF: string;
    Data: string;
    Hora: string;
    Comentário: string;
  }> = [];

  sessao.projetos.forEach((projeto) => {
    projeto.votos.forEach((voto) => {
      dados.push({
        Sessão: sessao.titulo,
        Projeto: projeto.titulo,
        'Projeto Descrição': projeto.descricao || '',
        Participante: voto.nomeParticipante,
        CPF: voto.cpfMascarado,
        Data: formatarData(voto.dataVoto),
        Hora: formatarHora(voto.dataVoto),
        Comentário: voto.comentario || '',
      });
    });
  });

  if (dados.length === 0) {
    dados.push({
      Sessão: sessao.titulo,
      Projeto: '',
      'Projeto Descrição': '',
      Participante: '',
      CPF: '',
      Data: '',
      Hora: '',
      Comentário: 'Nenhum voto registrado',
    });
  }

  const planilha = XLSX.utils.json_to_sheet(dados);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, 'Votos');

  const nomeArquivo = `votacao_${sessao.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(livro, nomeArquivo);
}

function DetalhesSessao({ sessao }: { sessao: SessaoRelatorio }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{sessao.titulo}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={sessao.ativa ? 'default' : 'secondary'}>
              {sessao.ativa ? 'Ativa' : 'Inativa'}
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {sessao.totalVotos} votos
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportarParaExcel(sessao)}
            >
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projetos" className="w-full">
          <TabsList>
            <TabsTrigger value="projetos">Por Projeto</TabsTrigger>
          </TabsList>

          <TabsContent value="projetos" className="space-y-4 mt-4">
            {sessao.projetos.map((projeto) => (
              <div key={projeto.id} className="border rounded-lg">
                <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{projeto.titulo}</h3>
                    {projeto.descricao && (
                      <p className="text-sm text-slate-500 truncate max-w-md">
                        {projeto.descricao}
                      </p>
                    )}
                  </div>
                  <Badge>
                    <Users className="h-3 w-3 mr-1" />
                    {projeto.totalVotos} votos
                  </Badge>
                </div>
                <TabelaVotosProjeto projeto={projeto} />
              </div>
            ))}
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}

export default function RelatorioVotosPage() {
  const [sessaoSelecionada, setSessaoSelecionada] = useState<string>('todas');
  const { relatorio, isLoading } = useRelatorioVotos(
    sessaoSelecionada !== 'todas' ? parseInt(sessaoSelecionada) : undefined
  );
  const { sessoes } = useSessoes();

  const sessoesFiltradas = sessaoSelecionada === 'todas'
    ? relatorio
    : relatorio.filter((s) => s.id === parseInt(sessaoSelecionada));

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <Header titulo="Relatório de Votos" />

        <div className="px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" />
              <span className="font-medium">Selecione uma sessão para visualizar os votos</span>
            </div>
            <Select value={sessaoSelecionada} onValueChange={setSessaoSelecionada}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Todas as sessões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as sessões</SelectItem>
                {sessoes.map((sessao) => (
                  <SelectItem key={sessao.id} value={String(sessao.id)}>
                    {sessao.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              Carregando relatório...
            </div>
          ) : sessoesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                Nenhuma sessão encontrada
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sessoesFiltradas.map((sessao) => (
                <DetalhesSessao key={sessao.id} sessao={sessao} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
