import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { FundTable } from './components/FundTable';
import type { Fund } from './types/fund';
import { supabase } from './lib/supabase';

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
  },
  {
    company_name: "우리자산운용",
    fund_name: "우리WON미국S&P500증권상장지수투자신탁(주식)",
    management_fees: 0.029,
    sales_fees: 0.001,
    custody_fees: 0.01,
    office_admin_fees: 0.01,
    other_expenses: 0.4794,
    ter: 0.05,
    front_end_commission: 0.1400,
    back_end_commission: 0.1900,
    trading_fee_ratio: 0.1143
  },
  {
    company_name: "케이비자산운용",
    fund_name: "KBRISE미국S&P500증권상장지수투자신탁(주식)",
    management_fees: 0.0001,
    sales_fees: 0.0001,
    custody_fees: 0.0035,
    office_admin_fees: 0.001,
    other_expenses: 0.4794,
    ter: 0.0047,
    front_end_commission: 0.0700,
    back_end_commission: 0.0800,
    trading_fee_ratio: 0.0593
  }
];

function App() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFunds() {
      try {
        const { data, error } = await supabase
          .from('funds')
          .select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setFunds(data);
        } else {
          // If no data in DB (or connection failed silently), use mock data for demo
          console.log("No data found in DB, using mock data");
          setFunds(MOCK_DATA);
        }
      } catch (err) {
        console.error('Error fetching funds:', err);
        setError('Failed to fetch data from database. Showing demo data.');
        setFunds(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }

    fetchFunds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fund Comparison</h2>
          <p className="mt-1 text-sm text-gray-500">
            Compare fees and expenses of major index funds.
          </p>
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