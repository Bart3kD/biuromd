<script lang="ts">
  import { parsePdfBrowser, type BankStatement } from './lib/parse-pdf-browser';
  import { fetchEurRates, rateBeforeDate, type NbpRate } from './lib/nbp';

  // ####################
  // State Types
  // ####################

  type AppState =
    | { type: 'idle' }
    | { type: 'parsing'; fileName: string }
    | { type: 'parse-failed'; error: string }
    | { type: 'fetching-rates'; fileName: string; statement: BankStatement }
    | { type: 'done'; fileName: string; statement: BankStatement; rates: NbpRate[] };

  function assertIsNever(x: never): never {
    throw new Error(`Unexpected state: ${JSON.stringify(x)}`);
  }

  // ####################
  // State
  // ####################

  let appState = $state<AppState>({ type: 'idle' });
  let isDragging = $state(false);
  let ratesError = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement>();

  // ####################
  // Derived
  // ####################

  let plnAmounts = $derived.by(() => {
    if (appState.type !== 'done') return [];
    const { statement, rates } = appState;
    return statement.transactions.map(tx => {
      const rate = rateBeforeDate(rates, tx.bookingDate);
      if (!rate) return null;
      return { rate: rate.mid, pln: tx.amount * rate.mid };
    });
  });

  let wydatkiTotals = $derived.by(() => {
    if (appState.type !== 'done') return { eur: 0, pln: 0 };
    const { statement } = appState;
    let eur = 0;
    let pln = 0;
    statement.transactions.forEach((tx, i) => {
      if (tx.description.includes('ZAKUP PRZY UŻYCIU KARTY') && tx.amount < 0) {
        eur += tx.amount;
        const p = plnAmounts[i];
        if (p) pln += p.pln;
      }
    });
    return { eur, pln };
  });

  // ####################
  // Actions
  // ####################

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      appState = { type: 'parse-failed', error: 'Please select a PDF file.' };
      return;
    }
    ratesError = null;
    appState = { type: 'parsing', fileName: file.name };

    let parsed: BankStatement;
    try {
      const buffer = await file.arrayBuffer();
      parsed = await parsePdfBrowser(buffer);
    } catch (e) {
      appState = { type: 'parse-failed', error: e instanceof Error ? e.message : String(e) };
      return;
    }

    const fileName = file.name;

    if (parsed.transactions.length === 0) {
      appState = { type: 'done', fileName, statement: parsed, rates: [] };
      return;
    }

    appState = { type: 'fetching-rates', fileName, statement: parsed };

    const bookingDates = parsed.transactions.map(tx => tx.bookingDate).sort();
    const startDate = new Date(bookingDates[0]);
    startDate.setDate(startDate.getDate() - 30);
    const start = startDate.toISOString().split('T')[0];
    const latest = bookingDates[bookingDates.length - 1];

    try {
      const rates = await fetchEurRates(start, latest);
      appState = { type: 'done', fileName, statement: parsed, rates };
    } catch (e) {
      ratesError = e instanceof Error ? e.message : String(e);
      appState = { type: 'done', fileName, statement: parsed, rates: [] };
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }

  function formatEur(n: number): string {
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatPln(n: number): string {
    return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
</script>

<div class="min-h-screen bg-background">
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

    {#if appState.type === 'idle'}
      <!-- Drop Zone -->
      <div
        role="button"
        tabindex="0"
        class="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center transition-colors cursor-pointer
          {isDragging ? 'border-primary bg-muted/60' : 'border-border bg-muted/20 hover:bg-muted/40'}"
        ondrop={onDrop}
        ondragover={onDragOver}
        ondragleave={onDragLeave}
        onclick={() => fileInput?.click()}
        onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
      >
        <input
          bind:this={fileInput}
          type="file"
          accept=".pdf"
          class="hidden"
          onchange={onFileChange}
        />
        <svg
          class="mb-4 h-12 w-12 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p class="text-base font-medium text-foreground">Drop your PDF here</p>
        <p class="mt-1 text-sm text-muted-foreground">or <span class="text-primary underline-offset-2 hover:underline">click to browse</span></p>
        <p class="mt-3 text-xs text-muted-foreground">Supports bank statement PDFs</p>
      </div>

    {:else if appState.type === 'parsing'}
      <!-- Loading: Parsing PDF -->
      <div class="flex flex-col items-center justify-center rounded-lg border bg-card p-16 text-center">
        <svg class="mb-4 h-8 w-8 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm text-muted-foreground">Parsing <span class="font-medium text-foreground">{appState.fileName}</span>…</p>
      </div>

    {:else if appState.type === 'parse-failed'}
      <!-- Error -->
      <div class="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <strong class="font-medium">Error:</strong> {appState.error}
        <button
          class="ml-3 underline-offset-2 hover:underline"
          onclick={() => { appState = { type: 'idle' }; }}
        >Dismiss</button>
      </div>

    {:else if appState.type === 'fetching-rates'}
      <!-- Loading: Fetching NBP rates -->
      <div class="flex flex-col items-center justify-center rounded-lg border bg-card p-16 text-center">
        <svg class="mb-4 h-8 w-8 animate-spin text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <p class="text-sm text-muted-foreground">Fetching NBP rates…</p>
      </div>

    {:else if appState.type === 'done'}
      <!-- NBP Rate Error (non-blocking) -->
      {#if ratesError}
        <div class="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <strong class="font-medium">NBP rates unavailable:</strong> {ratesError}
          <button
            class="ml-3 underline-offset-2 hover:underline"
            onclick={() => { ratesError = null; }}
          >Dismiss</button>
        </div>
      {/if}

      <!-- Toolbar -->
      <div class="mb-6 flex items-center justify-between print:hidden">
        <h2 class="text-lg font-semibold text-foreground">{appState.fileName}</h2>
        <button
          class="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          onclick={() => { appState = { type: 'idle' }; ratesError = null; }}
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Upload another
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="mb-6 grid grid-cols-2 gap-4">
        <div class="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Wydatki kartą (EUR)</p>
          <p class="mt-1 text-lg font-semibold text-red-600">{formatEur(wydatkiTotals.eur)} EUR</p>
        </div>
        <div class="rounded-lg border bg-card px-4 py-3 shadow-sm">
          <p class="text-xs text-muted-foreground uppercase tracking-wide">Wydatki kartą (PLN)</p>
          <p class="mt-1 text-lg font-semibold text-red-600">{wydatkiTotals.pln !== 0 ? formatPln(wydatkiTotals.pln) : '—'} {wydatkiTotals.pln !== 0 ? 'PLN' : ''}</p>
        </div>
      </div>

      <!-- Data Table -->
      <div class="rounded-lg border bg-card shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/40">
                <th class="h-11 px-4 text-left align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Data księgowania</th>
                <th class="h-11 px-4 text-left align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Data operacji</th>
                <th class="h-11 px-4 text-left align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide">Opis</th>
                <th class="h-11 px-4 text-right align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">EUR</th>
                <th class="h-11 px-4 text-right align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Średnia NBP</th>
                <th class="h-11 px-4 text-right align-middle text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">PLN</th>
              </tr>
            </thead>
            <tbody>
              {#each appState.statement.transactions as tx, i}
                {@const pln = plnAmounts[i]}
                <tr class="border-b transition-colors hover:bg-muted/30 {i % 2 === 1 ? 'bg-muted/10' : ''}">
                  <td class="px-4 py-3 w-20 align-middle font-mono text-xs text-muted-foreground whitespace-nowrap">{tx.bookingDate}</td>
                  <td class="px-4 py-3 w-20 align-middle font-mono text-xs text-muted-foreground whitespace-nowrap">{tx.operationDate}</td>
                  <td class="px-4 py-3 align-middle text-foreground max-w-xs">
                    <span class="line-clamp-2 leading-relaxed" title={tx.description}>{tx.description}</span>
                  </td>
                  <td class="px-4 py-3 w-20 align-middle text-right font-mono font-medium whitespace-nowrap {tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}">
                    {tx.amount >= 0 ? '+' : ''}{formatEur(tx.amount)}
                  </td>
                  <td class="px-4 py-3 align-middle text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {#if pln}
                      {pln.rate.toFixed(4)}
                    {:else}
                      —
                    {/if}
                  </td>
                  <td class="px-4 py-3 w-32 align-middle text-right font-mono font-medium whitespace-nowrap text-white print:text-black {tx.description.includes('ZAKUP PRZY UŻYCIU KARTY') ? 'bg-purchase-highlight print:text-purchase-highlight!' : ''}">
                    {#if pln}
                      {tx.amount >= 0 ? '+' : ''}{formatPln(pln.pln)}
                    {:else}
                      —
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

    {:else}
      {assertIsNever(appState)}
    {/if}

  </div>
</div>
