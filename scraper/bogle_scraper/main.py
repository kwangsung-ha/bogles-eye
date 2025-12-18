import asyncio
import csv
import os
from datetime import datetime
from playwright.async_api import async_playwright

async def scrape_fund_fees():
    url = "https://dis.kofia.or.kr/websquare/index.jsp?w2xPath=/wq/fundann/DISFundFeeCMS.xml&divisionId=MDIS01005001000000&serviceId=SDIS01005001000"
    keyword = "P500증권상장지수투자신탁(주식)"
    today = datetime.now().strftime("%Y-%m-%d")
    output_dir = "data"
    output_file = f"{output_dir}/fund_fees_{today}.csv"

    os.makedirs(output_dir, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()

        print(f"[{datetime.now()}] 페이지 이동: {url}")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(5000)

        # 1. 검색어 입력 및 버튼 클릭
        print(f"[{datetime.now()}] 검색 시작: {keyword}")
        try:
            # 검색창
            search_input = page.locator("#fundNm")
            await search_input.wait_for(timeout=10000)
            await search_input.fill(keyword)
            
            # 검색 버튼
            search_btn = page.locator("#btnSear")
            await search_btn.click()
            print(f"[{datetime.now()}] '#btnSear' 버튼 클릭 완료")
            
            # 로딩 대기
            await page.wait_for_timeout(5000)
            
        except Exception as e:
            print(f"[{datetime.now()}] 검색 오류: {e}")

        rows_data = []
        seen_funds = set() # 펀드명(공백제거) 중복 체크용

        async def extract(container):
            # 모든 행을 가져와서 Y 좌표(top)를 기준으로 그룹화 (테이블이 나뉜 경우 대비)
            rows = await container.query_selector_all("tr")
            groups = {}
            for row in rows:
                bbox = await row.bounding_box()
                if bbox and bbox['height'] > 0: # 보이는 행만
                    y = int(bbox['y']) # 정수형으로 변환하여 오차 허용
                    # 오차 범위 (±2px) 내에 있으면 같은 그룹
                    found_key = None
                    for key in groups.keys():
                        if abs(key - y) <= 2:
                            found_key = key
                            break
                    
                    if found_key is not None:
                        groups[found_key].append(row)
                    else:
                        groups[y] = [row]
            
            # 각 Y 좌표 그룹별로 데이터 병합
            for y in sorted(groups.keys()):
                group_rows = groups[y]
                combined_texts = []
                for r in group_rows:
                    cells = await r.query_selector_all("td")
                    for c in cells:
                        combined_texts.append((await c.inner_text()).strip())
                
                # 데이터 확인 및 매핑
                if any("P500" in t for t in combined_texts):
                    # 인덱스 매핑 (데이터 분석 결과 기반)
                    if len(combined_texts) >= 16:
                        fund_name = combined_texts[1]
                        # 중복 체크 (공백 제거 후 비교)
                        normalized_name = fund_name.replace(" ", "").replace("\u00a0", "")
                        
                        if normalized_name not in seen_funds:
                            data = {
                                "company_name": combined_texts[0], # 운용회사
                                "fund_name": fund_name,
                                "management_fees": combined_texts[5],
                                "sales_fees": combined_texts[6],
                                "custody_fees": combined_texts[7],
                                "office_admin_fees": combined_texts[8],
                                "other_expenses": combined_texts[10],
                                "ter": combined_texts[9],
                                "front_end_commission": combined_texts[11],
                                "back_end_commission": combined_texts[12],
                                "trading_fee_ratio": combined_texts[15]
                            }
                            
                            rows_data.append(data)
                            seen_funds.add(normalized_name)
                            print(f"[{datetime.now()}] 수집: {fund_name}")

        await extract(page)
        for f in page.frames: await extract(f)

        # 저장
        if rows_data:
            with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=rows_data[0].keys())
                writer.writeheader()
                writer.writerows(rows_data)
            print(f"[{datetime.now()}] 저장 성공: {output_file} ({len(rows_data)}건)")
        else:
            print(f"[{datetime.now()}] 데이터 추출 실패")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_fund_fees())