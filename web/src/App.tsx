import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { FundTable } from './components/FundTable';
import type { Fund } from './types/fund';
import { supabase } from './lib/supabase';
import Papa from 'papaparse';

// Mock data based on provided CSV for fallback/demo
const MOCK_DATA: Fund[] = [
  {
    company_name: "미래에셋자산운용",
    fund_name: "미래에셋TIGER미국S&P500증권상장지수투자신탁(주식)",
    management_fees: 0.0002,
    sales_fees: 0.0001,
    custody_fees: 0.005,
    office_admin_fees: 0.0015,
    other_expenses: 0.4794,
    ter: 0.0068,
    front_end_commission: 0.0600,
    back_end_commission: 0.0700,
    trading_fee_ratio: 0.0376
  },
  {
    company_name: "엔에이치아문디자산운용",
    fund_name: "NH-AmundiHANARO미국S&P500증권상장지수투자신탁(주식)",
    management_fees: 0.02,
    sales_fees: 0.005,
    custody_fees: 0.01,
    office_admin_fees: 0.01,
    other_expenses: 0.4794,
    ter: 0.045,
    front_end_commission: 0.5200,
    back_end_commission: 0.5700,
    trading_fee_ratio: 0.0221
  }
];

function getTodayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'csv' | 'db' | 'mock' | null>(null);

  useEffect(() => {
    async function fetchData() {
      const today = getTodayString();
      const csvPath = `/data/fund_fees_${today}.csv`;
      
      console.log(`Attempting to fetch CSV from: ${csvPath}`);

      try {
        // 1. Try fetching CSV
        const response = await fetch(csvPath);
        if (response.ok) {
          const csvText = await response.text();
          Papa.parse<Fund>(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                console.log("Successfully loaded from CSV");
                setFunds(results.data);
                setSource('csv');
                setLoading(false);
              } else {
                throw new Error("CSV parsed but empty");
              }
            },
            error: (err: Error) => {
              throw err;
            }
          });
          return; // Exit if CSV load succeeds (handled in complete callback)
        } else {
          console.warn("CSV not found or fetch failed, falling back to DB.");
        }
      } catch (err) {
        console.warn("Error loading CSV:", err);
      }

      // 2. Fallback to Supabase DB
      try {
        console.log("Fetching from Supabase DB...");
        const { data, error } = await supabase
          .from('funds')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          console.log("Successfully loaded from DB");
          setFunds(data);
          setSource('db');
        } else {
          // 3. Fallback to Mock Data
          console.log("No data in DB, using Mock Data");
          setFunds(MOCK_DATA);
          setSource('mock');
        }
      } catch (err) {
        console.error('Error fetching funds from DB:', err);
        setError('Failed to fetch data. Showing demo data.');
        setFunds(MOCK_DATA);
        setSource('mock');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fund Comparison</h2>
            <p className="mt-1 text-sm text-gray-500">
              Compare fees and expenses of major index funds.
            </p>
          </div>
          {source && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Source: {source.toUpperCase()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <FundTable data={funds} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;