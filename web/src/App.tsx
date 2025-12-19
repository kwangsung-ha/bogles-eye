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
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-700 leading-relaxed">
          <p>
            실제투자자가부담하는보수·비용수준=TER(A+B)+판매수수료율(C)+매매·
            중개수수료율(D)
          </p>
          <p className="mt-1">
            - 총보수·비용비율(TER,Total Expense Ratio) = (보수합계 + 기타비용) ÷ 펀드순자산
          </p>
          <p className="mt-3">2008년 6월말 발표분부터 총비용비율 공시기준이 변경</p>
          <p className="mt-1">- 기타비용에서 매매중개수수료분을 제외하고, 이를 별도 표기</p>
          <p className="mt-1">
            - 모자펀드 및 종류형 펀드의 경우 모펀드발생비용을 자펀드의 투자비율로 안분하여 적용
          </p>
          <p className="mt-3">본 자료는 공모펀드를 대상으로 하고 있습니다.</p>
          <p className="mt-3">
            운용개시일이 1년 미만인 경우 초기 자산 매입으로 인해 매매중개수수료율이 과다하게 발생할 수
            있으니 이용에 참고하시기 바랍니다.
          </p>
          <p className="mt-3">
            ※ 상기 내용은 월별자료이며, 제출사 에서 내용이 정정되어 재공시 하는 경우 내용이 변경 될 수
            있습니다.
          </p>
          <p className="mt-3">
            데이터 출처: 금융투자협회 전자공시서비스
          </p>
          <p className="mt-1">
            본 자료는 참고용이며, 정보의 정확성 또는 완전성에 대해 어떠한 책임도 지지 않습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
