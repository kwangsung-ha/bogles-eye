# Task: 01. 금융투자협회 펀드 비용 스크레이퍼

## Context

- **배경:** 금융투자협회 웹사이트는 동적 UI(WebSquare)를 사용하여 펀드 관련 데이터를 제공하며, 이 데이터는 표준적인 HTML 파싱 방법으로는 수집하기 어렵습니다.
- **대상 URL:** [금융투자협회 펀드별 보수비용 비교](https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeCMS.xml&divisionId=MDIS01005001000000&serviceId=SDIS01005001000)
- **목표:** "펀드별 보수비용 비교" 페이지에서 사용자가 키워드로 펀드를 검색하고, 결과 테이블의 데이터를 수집하여 JSON 파일로 저장하는 스크레이퍼를 개발합니다.

## Design

- **Tool:** Playwright (Python)
- **Flow:**
    1.  **페이지 이동:** 지정된 URL으로 이동합니다.
    2.  **검색 실행:** 펀드명 검색창에 `P500증권상장지수투자신탁(주식)`을 입력하고 '조회' 버튼을 클릭합니다.
    3.  **데이터 추출:** 검색 결과가 로드된 후, 결과 테이블의 모든 행(row)을 순회하며 데이터를 추출합니다.
    4.  **데이터 저장:** 추출된 데이터를 아래 `Data Structure`에 맞춰 `data/fund_fees_{YYYY-MM-DD}.csv` 파일로 저장합니다.
- **Data Structure (CSV):**

| Column | Description |
| :--- | :--- |
| fund_name | 펀드명 |
| management_fees | 운용보수 |
| sales_fees | 판매보수 |
| custody_fees | 수탁보수 |
| office_admin_fees | 사무관리보수 |
| other_expenses | 기타비용 |
| ter | TER |
| front_end_commission | 판매수수료(선취) |
| back_end_commission | 판매수수료(후취) |
| trading_fee_ratio | 매매/중개수수료율 |

## Todo List

- [x] `docs/tasks/01-scraper.md` 작업 문서 작성 및 리뷰 요청
- [x] Poetry 프로젝트(`bogle-scraper`) 설정 및 Playwright 브라우저 설치
- [x] 페이지 이동 및 키워드 검색/조회 기능 구현
- [x] 결과 테이블에서 데이터 추출 기능 구현 (모든 행 수집)
- [x] 추출된 데이터를 CSV 파일로 저장하는 기능 구현 (`data/fund_fees_YYYY-MM-DD.csv`)
- [ ] 코드 리뷰 및 `feat: scraper` 커밋 준비

## Dev Log

- **2025-12-18:**
    - 초기 설계에서 `requests`+`BeautifulSoup`을 고려했으나, 대상 사이트가 동적 UI를 사용함을 확인하고 `Playwright`로 변경.
    - 데이터 로딩 방식 분석을 위해 네트워크 요청을 감시했으나, 복잡한 내부 API 호출 구조로 인해 UI 상호작용(검색) 방식으로 전략 수정.
    - `GEMINI.md` 프로토콜에 따라 작업 관리 방식을 정립하고 본 문서 생성.
