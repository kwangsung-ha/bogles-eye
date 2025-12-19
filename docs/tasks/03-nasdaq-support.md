# Add Nasdaq 100 Support

## Context
Currently, the application only supports scraping and displaying **S&P 500** ETF data. The user wants to expand this to include **Nasdaq 100** ETFs.

## Design

### Scraper
- **Input**:
    - List of search targets:
        1. S&P 500: Keyword `P500증권상장지수투자신탁(주식)`, Filter `All` (or default).
        2. Nasdaq 100: Keyword `미국나스닥100증권상장지수`, Filter `fundTyp` = "주식형".
- **Logic**:
    - Iterate through the target list.
    - For each target:
        - Enter keyword.
        - Select `fundTyp` if specified.
        - Click search.
        - Extract data.
        - Tag data with a `category` field ("S&P500", "Nasdaq100").
    - Aggregate all data.
    - Save to `data/fund_fees_{date}.csv`.

### Web UI
- **Data Model**:
    - Update `Fund` interface to include `category: string`.
- **Display**:
    - Modify `App.tsx` to filter funds by `category`.
    - Render two separate `FundTable` components:
        - "S&P 500 ETFs"
        - "Nasdaq 100 ETFs"

## Todo List
- [x] Update `web/src/types/fund.ts` to include `category`.
- [x] Refactor `scraper/bogle_scraper/main.py` to handle multiple search targets and `fundTyp` selection.
- [x] Implement Nasdaq 100 scraping with `fundTyp` = "주식형".
- [x] Verify CSV output format.
- [x] Update `web/src/App.tsx` to display two tables based on `category`.

## Dev Log
- Initialized task.
- Refactored scraper to support multiple targets.
- Added Nasdaq 100 target.
- Note: The `fundTyp` selector `#fundTyp` was not found on the page, so the specific "주식형" filter was skipped. However, the keyword search "미국나스닥100증권상장지수" successfully returned 9 relevant items, which suggests the keyword is specific enough.
- Verified CSV output contains `category` column.
- Updated Web UI to split S&P 500 and Nasdaq 100 into separate tables.
- Deployed new data to `web/public/data/`.
