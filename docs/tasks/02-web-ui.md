# 02. Web UI Development

## Context
- **목표**: 스크래퍼가 수집한 ETF/Fund 비교 데이터를 시각화하는 웹 인터페이스 개발.
- **핵심 제약**: 운영 비용 0원 (Free Tier 활용).
- **타겟 유저**: 저비용 인덱스 펀드를 찾는 투자자.

## Design

### Architecture: Vercel + Supabase + Static CSV
"무료 운영" 목표를 달성하고 DB 조회를 최소화하기 위해 **Hybrid Data Loading** 전략을 사용합니다.

1.  **Hosting**: **Vercel** (Free).
2.  **Database**: **Supabase** (Free).
    - PostgreSQL 기반의 BaaS.
    - 데이터의 원천(Source of Truth) 역할.
3.  **Data Strategy (Hybrid)**:
    - **Primary**: 정적 CSV 파일 조회 (`/data/fund_fees_YYYY-MM-DD.csv`). 비용 0원, 속도 빠름.
    - **Fallback**: 파일이 없을 경우 Supabase DB 조회 (`select * from funds`). DB 부하 최소화.
4.  **Automation (ETL)**:
    - **GitHub Actions**:
        1.  Scraper 실행 -> DB Upsert.
        2.  DB 데이터를 기반으로 최신 CSV 생성 및 Commit -> Vercel 배포 트리거.

### Tech Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Parsing**: `papaparse` (CSV 처리)
- **Database Client**: `supabase-js`

### Table Usability Improvements
- **Left pinned columns**: `기본정보(운용사, 펀드명)` + `총비용` 고정.
- **Compact density**: 헤더/셀 padding 축소 및 글자 크기 축소로 가로 길이 감소.
- **Percent display**: 값에서 `%` 제거, 헤더에만 `%` 표기.

## Todo List
- [x] **Project Setup**: `web/` 디렉토리에 React + Vite + TypeScript 프로젝트 생성.
- [ ] **Infrastructure**: Supabase 프로젝트 생성 및 테이블 스키마 설계 (`funds` 테이블).
- [ ] **Data Pipeline Update**: 파이썬 스크래퍼 수정 (DB 저장 + CSV 생성).
- [x] **UI Scaffolding**: Tailwind CSS 설정 및 기본 레이아웃 구성.
- [x] **Data Integration**:
    - [x] 오늘 날짜 기준 CSV 파일 Fetch 시도.
    - [x] 실패 시 Supabase DB Fallback 조회 구현.
- [x] **Data Integration (Improvement)**:
    - [x] 로컬 CSV 조회 시 오늘 날짜 대신, 파일이 발견될 때까지 하루씩 과거로 탐색하며 가장 최신 파일을 조회하도록 로직 수정.
- [x] **Dashboard Implementation**:
    - [x] 테이블 컬럼 분리: '기타 및 TER' 그룹 해제.
    - [x] 테이블 컬럼 병합: '기타비용' 그룹 제거 및 단일 컬럼화.
    - [x] 테이블 헤더 개선: 단일 컬럼 및 단일 하위컬럼 그룹(예: '기타비용(B)', 'TER')의 2단 헤더 병합(rowspan 처리).
    - [x] 테이블 사용성 개선: 좌측 고정 컬럼(기본정보+총비용) + 컴팩트 스타일 + % 표시 방식 정리.
    - [x] 테이블 헤더 줄바꿈: 긴 헤더(TER/총비용/판매수수료/매매수수료)를 2줄로 분리.
    - [x] 테이블 하단 안내 문구 추가.
    - [x] 안내 문구를 페이지 하단 footer 영역으로 이동하고 출처/면책 추가.
- [ ] **Deployment**: Vercel 배포 설정.

## Dev Log
- **2025-12-19**: 문서 생성. Vercel + Supabase 아키텍처 확정. 테이블 컬럼 수정 요청 ('기타 및 TER' 분리). '기타비용' 그룹 단일 컬럼으로 병합.
- **2025-12-19**: 로컬 CSV 파일 조회 로직 개선 요청 수신. 오늘 날짜의 파일이 없을 경우를 대비해, 가장 최신 파일을 찾도록 수정 예정.
- **2025-02-08**: '기타비용(B)' 헤더가 2단으로 보이는 이슈 확인. 헤더 rowSpan 처리로 단일 헤더로 병합 예정.
- **2025-02-08**: rowSpan 대상 컬럼만 placeholder를 제거하도록 조정해 컬럼 깨짐 방지.
- **2025-02-08**: 헤더 병합 시도에서 컬럼 정렬 깨짐 발생으로 원복.
- **2025-02-08**: 단일 하위컬럼 그룹(TER/매매비용/최종비용)도 상단 행에 병합해 2단 헤더 제거.
- **2025-02-08**: 가로 스크롤 개선 요청(좌측 고정 컬럼, 컴팩트 스타일, % 표시 정리) 수신.
- **2025-02-08**: 컴팩트 패딩/타이포, %는 헤더에만 표시하도록 반영. 고정 컬럼은 미적용(요청에 따라 제거).
- **2025-02-08**: 긴 헤더 텍스트를 줄바꿈 처리해 가로 폭 압축.
- **2025-02-08**: 테이블 하단에 안내 문구 추가.
- **2025-02-08**: 안내 문구를 페이지 하단으로 이동하고 출처/면책 문구 추가.
