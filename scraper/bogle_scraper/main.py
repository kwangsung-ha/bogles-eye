import asyncio
import csv
import os
from datetime import datetime
from playwright.async_api import async_playwright

async def scrape_fund_fees():
    base_url = "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeCMS.xml&divisionId=MDIS01005001000000&serviceId=SDIS01005001000"
    
    # Define search targets
    targets = [
        {
            "keyword": "P500증권상장지수투자신탁(주식)",
            "category": "S&P500",
            "fund_type": None
        },
        {
            "keyword": "미국나스닥100증권상장지수",
            "category": "Nasdaq100",
            "fund_type": "주식형"
        }
    ]

    today = datetime.now().strftime("%Y-%m-%d")
    output_dir = "data"
    output_file = f"{output_dir}/fund_fees_{today}.csv"

    os.makedirs(output_dir, exist_ok=True)

    all_rows_data = []
    seen_funds = set() # Global duplicate check

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        for target in targets:
            keyword = target["keyword"]
            category = target["category"]
            fund_type = target["fund_type"]
            
            print(f"[{datetime.now()}] 작업 시작: {category} (키워드: {keyword})")
            
            try:
                # Reload page for each target to ensure clean state
                await page.goto(base_url, wait_until="networkidle")
                await page.wait_for_timeout(3000)

                # 1. 펀드 유형 선택 (Optional)
                if fund_type:
                    print(f"[{datetime.now()}] 펀드유형 설정 시도: {fund_type}")
                    # Try to find the select box. Assuming ID might contain 'fundTyp' or similar based on user hint
                    # or it might be a combobox. 
                    # Strategy: Look for a select/combobox and try to select the option containing the text.
                    # Since we don't know the exact ID, we might need to rely on the label or just generic inputs.
                    # However, based on KOFIA pages, IDs are often #fundTyp or similar.
                    try:
                        # Attempt 1: Select by ID 'fundTyp' if it exists (User hint)
                        # We use a timeout to not block too long if it doesn't exist.
                        select_locator = page.locator("select#fundTyp, select[name='fundTyp']")
                        if await select_locator.count() > 0:
                             await select_locator.select_option(label=fund_type)
                        else:
                            # Attempt 2: Look for any select that has '주식형' as an option
                            # This is a bit risky but fallback.
                            # Or maybe it's a WebSquare custom dropdown.
                            # For now, let's assume standard select or skip if failed (but log warning).
                             print(f"[{datetime.now()}] 경고: '#fundTyp' 셀렉터를 찾을 수 없음. 건너뜀.")
                    except Exception as e:
                         print(f"[{datetime.now()}] 펀드유형 선택 실패 (무시하고 진행): {e}")

                # 2. 검색어 입력
                search_input = page.locator("#fundNm")
                await search_input.wait_for(timeout=10000)
                await search_input.fill(keyword)
                
                # 3. 검색 버튼 클릭
                search_btn = page.locator("#btnSear")
                await search_btn.click()
                print(f"[{datetime.now()}] 검색 버튼 클릭 완료")
                
                # 로딩 대기
                await page.wait_for_timeout(5000)
                
                # 4. 데이터 추출
                target_rows = []
                
                async def extract(container):
                    rows = await container.query_selector_all("tr")
                    groups = {}
                    for row in rows:
                        bbox = await row.bounding_box()
                        if bbox and bbox['height'] > 0:
                            y = int(bbox['y'])
                            found_key = None
                            for key in groups.keys():
                                if abs(key - y) <= 2:
                                    found_key = key
                                    break
                            
                            if found_key is not None:
                                groups[found_key].append(row)
                            else:
                                groups[y] = [row]
                    
                    for y in sorted(groups.keys()):
                        group_rows = groups[y]
                        combined_texts = []
                        for r in group_rows:
                            cells = await r.query_selector_all("td")
                            for c in cells:
                                combined_texts.append((await c.inner_text()).strip())
                        
                        # 데이터 확인 (키워드 검증은 완화: 검색 결과이므로)
                        if len(combined_texts) >= 16:
                            # 1번째 인덱스가 펀드명
                            fund_name = combined_texts[1]
                            normalized_name = fund_name.replace(" ", "").replace("\u00a0", "")
                            
                            # Skip if header or empty
                            if "운용사" in combined_texts[0]:
                                continue

                            if normalized_name not in seen_funds:
                                data = {
                                    "company_name": combined_texts[0],
                                    "fund_name": fund_name,
                                    "management_fees": combined_texts[5],
                                    "sales_fees": combined_texts[6],
                                    "custody_fees": combined_texts[7],
                                    "office_admin_fees": combined_texts[8],
                                    "other_expenses": combined_texts[11],
                                    "ter": combined_texts[12],
                                    "front_end_commission": combined_texts[13],
                                    "back_end_commission": combined_texts[14],
                                    "trading_fee_ratio": combined_texts[15],
                                    "category": category # Add Category
                                }
                                target_rows.append(data)
                                seen_funds.add(normalized_name)

                await extract(page)
                for f in page.frames: await extract(f)
                
                print(f"[{datetime.now()}] {category} 수집 완료: {len(target_rows)}건")
                all_rows_data.extend(target_rows)

            except Exception as e:
                print(f"[{datetime.now()}] 오류 발생 ({category}): {e}")

        # 저장
        if all_rows_data:
            with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=all_rows_data[0].keys())
                writer.writeheader()
                writer.writerows(all_rows_data)
            print(f"[{datetime.now()}] 전체 저장 성공: {output_file} (총 {len(all_rows_data)}건)")
        else:
            print(f"[{datetime.now()}] 데이터 추출 실패 (데이터 없음)")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_fund_fees())
