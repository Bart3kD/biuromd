export interface NbpRate {
  effectiveDate: string;
  mid: number;
}

// Fetch all EUR/PLN rates for a date range from the NBP Table A API
export async function fetchEurRates(start: string, end: string): Promise<NbpRate[]> {
  const url = `https://api.nbp.pl/api/exchangerates/rates/a/eur/${start}/${end}/?format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`NBP API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return (data.rates as Array<{ effectiveDate: string; mid: number }>).map(r => ({
    effectiveDate: r.effectiveDate,
    mid: r.mid,
  }));
}

// Find the most recent rate strictly before `date` (YYYY-MM-DD).
// Handles weekends, holidays etc. by picking the closest earlier date.
export function rateBeforeDate(rates: NbpRate[], date: string): NbpRate | null {
  let result: NbpRate | null = null;
  for (const rate of rates) {
    if (rate.effectiveDate < date) {
      result = rate;
    }
  }
  return result;
}
