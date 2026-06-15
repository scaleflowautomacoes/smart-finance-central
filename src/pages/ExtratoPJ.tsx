import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, FileUp, Loader2, RefreshCw, ShieldCheck, UploadCloud } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSupabaseFinancialData } from '@/hooks/useSupabaseFinancialData';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { createBankStatementImport, fingerprintTransaction, importStatementPayload, movementToEntry, movementToTransaction, upsertBankStatementEntries, type ExistingTransactionFingerprint } from '@/data/bankStatements';
import { formatBrazilianCurrency, hashText, parseStatementPdfText, type ParsedStatementImport, type ParsedStatementMovement } from '@/lib/bankStatementImport';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/financial';

GlobalWorkerOptions.workerSrc = workerUrl;

const defaultWorkspace: 'PF' | 'PJ' = 'PJ';

const normalizeText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

type PdfTextItem = { str?: string };

const buildExistingFingerprints = (transactions: Transaction[], workspace: 'PF' | 'PJ') => {
  const fingerprints = new Set<string>();
  transactions
    .filter((transaction) => transaction.origem === workspace && !transaction.deletado)
    .forEach((transaction) => {
      const payload: ExistingTransactionFingerprint = {
        nome: transaction.nome,
        tipo: transaction.tipo,
        data: transaction.data,
        valor: Number(transaction.valor),
        origem: transaction.origem,
        forma_pagamento: transaction.forma_pagamento,
      };
      fingerprints.add(fingerprintTransaction(payload));
    });
  return fingerprints;
};

const categoryNameMatches = (a?: string | null, b?: string | null) => {
  if (!a || !b) return false;
  const left = normalizeText(a);
  const right = normalizeText(b);
  return left === right || left.includes(right) || right.includes(left);
};

const extractPdfText = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: string[] = [];

  for (let index = 1; index <= pdf.numPages; index += 1) {
    const page = await pdf.getPage(index);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ((item as PdfTextItem).str ?? ''))
      .filter(Boolean)
      .join('\n')
      .trim();

    pages.push(pageText);
  }

  return pages;
};

const getPreviewStatus = (movement: ParsedStatementMovement, duplicate: boolean, transactionLinked: boolean) => {
  if (transactionLinked) return { label: 'Ligado', variant: 'default' as const };
  if (duplicate) return { label: 'Duplicado', variant: 'secondary' as const };
  return { label: 'Novo', variant: 'outline' as const };
};

const ExtratoPJ = () => {
  const [currentWorkspace, setCurrentWorkspace] = useState<'PF' | 'PJ'>(() => {
    const saved = localStorage.getItem('financial-workspace');
    return (saved as 'PF' | 'PJ') || defaultWorkspace;
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statement, setStatement] = useState<ParsedStatementImport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<{ imports: number; transactions: number; entries: number } | null>(null);

  const { transactions, categories, loading, refreshData } = useSupabaseFinancialData();
  const { showSuccess, showError, showInfo } = useToastNotifications();

  useEffect(() => {
    if (currentWorkspace !== 'PJ') {
      setCurrentWorkspace('PJ');
      return;
    }
    localStorage.setItem('financial-workspace', 'PJ');
  }, [currentWorkspace]);

  const currentFingerprints = useMemo(() => buildExistingFingerprints(transactions, currentWorkspace), [transactions, currentWorkspace]);

  const categoryLookup = useMemo(() => {
    return categories.filter((category) => category.origem === currentWorkspace);
  }, [categories, currentWorkspace]);

  const annotatedMovements = useMemo(() => {
    if (!statement) return [];

    return statement.movements.map((movement) => {
      const transactionPayload = movementToTransaction(movement, {
        origin: currentWorkspace,
        categoryId: null,
        existingFingerprint: null,
      });
      const fingerprint = fingerprintTransaction({
        nome: transactionPayload.nome,
        tipo: transactionPayload.tipo,
        data: transactionPayload.data,
        valor: transactionPayload.valor,
        origem: transactionPayload.origem,
        forma_pagamento: transactionPayload.forma_pagamento,
      });
      const duplicate = currentFingerprints.has(fingerprint);
      const category = categoryLookup.find((item) => item.tipo === movement.direction && categoryNameMatches(item.nome, movement.suggestedCategory));
      return {
        movement,
        fingerprint,
        duplicate,
        categoryId: category?.id ?? null,
        categoryName: category?.nome ?? movement.suggestedCategory,
        transactionPayload,
      };
    });
  }, [statement, currentWorkspace, currentFingerprints, categoryLookup]);

  const summary = useMemo(() => {
    if (!statement) return null;

    const uniqueMovements = annotatedMovements.filter((item) => !item.duplicate);
    const income = annotatedMovements.filter((item) => item.movement.direction === 'entrada').reduce((sum, item) => sum + item.movement.amount, 0);
    const expenses = annotatedMovements.filter((item) => item.movement.direction === 'saida').reduce((sum, item) => sum + item.movement.amount, 0);
    const linked = annotatedMovements.filter((item) => item.duplicate).length;
    const uncategorized = annotatedMovements.filter((item) => !item.categoryId).length;

    return {
      totalMovements: annotatedMovements.length,
      uniqueMovements: uniqueMovements.length,
      linked,
      uncategorized,
      income,
      expenses,
    };
  }, [annotatedMovements, statement]);

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setStatement(null);
    setSavedSummary(null);
    setParseError(null);

    if (!file) return;

    try {
      setIsParsing(true);
      showInfo('Lendo PDF do extrato PJ');
      const pages = await extractPdfText(file);
      const sourceHash = await hashText([file.name, file.size.toString(), file.lastModified.toString(), pages.join('\n')].join('|'));
      const parsed = await parseStatementPdfText(pages, file.name, sourceHash);
      setStatement(parsed);
      showSuccess('Extrato processado com sucesso');
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível ler o extrato PDF.';
      setParseError(message);
      showError('Falha ao processar o extrato');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!statement) return;

    try {
      setIsSaving(true);

      const importRow = await createBankStatementImport(importStatementPayload(statement, currentWorkspace));
      const transactionPayloads: TablesInsert<'transactions'>[] = [];
      const entryPayloads: TablesInsert<'bank_statement_entries'>[] = [];

      for (const item of annotatedMovements) {
        if (!item.duplicate) {
          const payload = movementToTransaction(item.movement, {
            origin: currentWorkspace,
            categoryId: item.categoryId,
            existingFingerprint: null,
          });
          transactionPayloads.push(payload);
        }
      }

      let insertedTransactions: Array<{ id: string }> = [];
      if (transactionPayloads.length > 0) {
        const { data, error } = await supabase
          .from('transactions')
          .insert(transactionPayloads)
          .select();

        if (error) throw error;
        insertedTransactions = data ?? [];
      }

      const insertedTransactionHashes = new Map<string, string>();
      insertedTransactions.forEach((transaction, index) => {
        const movement = annotatedMovements.filter((item) => !item.duplicate)[index];
        if (!movement) return;
        insertedTransactionHashes.set(movement.fingerprint, transaction.id);
      });

      for (const item of annotatedMovements) {
        const transactionId = item.duplicate ? null : insertedTransactionHashes.get(item.fingerprint) ?? null;
        entryPayloads.push(movementToEntry(importRow.id, currentWorkspace, item.movement, transactionId, item.fingerprint, item.categoryId));
      }

      await upsertBankStatementEntries(entryPayloads);
      await supabase
        .from('bank_statement_imports')
        .update({ status: 'applied', processed_at: new Date().toISOString() })
        .eq('id', importRow.id);

      setSavedSummary({
        imports: 1,
        transactions: insertedTransactions.length,
        entries: entryPayloads.length,
      });

      await refreshData();
      showSuccess(`Extrato importado: ${insertedTransactions.length} transações novas e ${entryPayloads.length} linhas auditáveis.`);
    } catch (error) {
      console.error('Erro ao salvar extrato:', error);
      showError('Não foi possível salvar o extrato no banco.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !statement) {
    return (
      <Layout currentWorkspace={currentWorkspace} onWorkspaceChange={setCurrentWorkspace} onNewTransaction={() => {}}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner text="Preparando estrutura do extrato PJ..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentWorkspace={currentWorkspace} onWorkspaceChange={setCurrentWorkspace} onNewTransaction={() => {}}>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-border/60 bg-card/90 shadow-lg shadow-black/5">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  <Building2 className="mr-2 h-3.5 w-3.5" />
                  Extrato PJ como fonte de verdade
                </Badge>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Raw + normalizado
                </Badge>
              </div>
              <CardTitle className="text-2xl">Importação do extrato bancário</CardTitle>
              <CardDescription>
                Faça o upload do PDF da conta PJ, revise os lançamentos extraídos e persista o histórico com trilha de auditoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6 text-center transition hover:bg-muted/30">
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-base font-semibold">Arraste ou selecione o PDF do extrato</div>
                  <div className="text-sm text-muted-foreground">Aceita exportação do banco com várias páginas e movimentações quebradas em linhas.</div>
                </div>
                <Button type="button" variant="secondary" className="rounded-xl">
                  <FileUp className="mr-2 h-4 w-4" />
                  Escolher arquivo
                </Button>
              </label>

              {parseError && (
                <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {parseError}
                </div>
              )}

              {selectedFile && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="rounded-full">{selectedFile.name}</Badge>
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card className="border-border/60 bg-card/90 shadow-lg shadow-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Workspace ativo</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Conta em análise</div>
                  <div className="text-2xl font-semibold">{currentWorkspace}</div>
                </div>
                <Badge variant={currentWorkspace === 'PJ' ? 'default' : 'secondary'} className="rounded-full px-3 py-1">
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  {currentWorkspace === 'PJ' ? 'PJ prioritário' : 'PF ativo'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/90 shadow-lg shadow-black/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={handleImport} disabled={!statement || isSaving || isParsing} className="rounded-xl">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Salvar extrato
                </Button>
                <Button variant="outline" onClick={() => statement && handleFileChange(selectedFile)} disabled={!selectedFile || isParsing} className="rounded-xl">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reprocessar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {statement && summary && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Movimentações</CardDescription>
                <CardTitle className="text-2xl">{summary.totalMovements}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{summary.uniqueMovements} novas, {summary.linked} duplicadas.</CardContent>
            </Card>
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Entradas / saídas</CardDescription>
                <CardTitle className="text-2xl">{formatBrazilianCurrency(summary.income)} / {formatBrazilianCurrency(summary.expenses)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Base do período importado do PDF.</CardContent>
            </Card>
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Sem categoria</CardDescription>
                <CardTitle className={cn('text-2xl', summary.uncategorized > 0 && 'text-amber-600')}>{summary.uncategorized}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Ajuste manual disponível após a importação.</CardContent>
            </Card>
            <Card className="border-border/60 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Saldo final</CardDescription>
                <CardTitle className="text-2xl">{formatBrazilianCurrency(statement.finalBalance)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Período {statement.periodStart || 'início'} até {statement.periodEnd || 'fim'}.</CardContent>
            </Card>
          </div>
        )}

        {savedSummary && (
          <Card className="border-emerald-500/30 bg-emerald-500/10">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <div className="font-semibold text-emerald-700 dark:text-emerald-300">Importação concluída</div>
                <div className="text-muted-foreground">{savedSummary.transactions} transações normalizadas e {savedSummary.entries} linhas brutas auditáveis persistidas.</div>
              </div>
              <Badge variant="outline" className="rounded-full border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                {savedSummary.imports} importação registrada
              </Badge>
            </CardContent>
          </Card>
        )}

        {isParsing && (
          <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-border/60 bg-card/80">
            <LoadingSpinner text="Extraindo páginas do PDF e normalizando movimentações..." />
          </div>
        )}

        {statement && !isParsing && (
          <Card className="border-border/60 bg-card/90 shadow-lg shadow-black/5">
            <CardHeader>
              <CardTitle className="text-xl">Prévia das linhas importadas</CardTitle>
              <CardDescription>Revisão de duplicados, categorias sugeridas e status antes de gravar no banco.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[620px] rounded-2xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {annotatedMovements.slice(0, 200).map((item, index) => {
                      const status = getPreviewStatus(item.movement, item.duplicate, false);
                      return (
                        <TableRow key={`${item.fingerprint}-${index}`}>
                          <TableCell className="whitespace-nowrap">{item.movement.statementDate}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.movement.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.movement.counterpartyName || 'Sem contraparte'}{item.movement.counterpartyBank ? ` • ${item.movement.counterpartyBank}` : ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell className={cn('whitespace-nowrap font-medium', item.movement.direction === 'entrada' ? 'text-emerald-600' : 'text-rose-600')}>
                            {item.movement.direction === 'entrada' ? '+' : '-'} {formatBrazilianCurrency(item.movement.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="rounded-full">
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ExtratoPJ;
