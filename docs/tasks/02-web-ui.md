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

## Todo List
- [x] **Project Setup**: `web/` 디렉토리에 React + Vite + TypeScript 프로젝트 생성.
- [ ] **Infrastructure**: Supabase 프로젝트 생성 및 테이블 스키마 설계 (`funds` 테이블).
- [ ] **Data Pipeline Update**: 파이썬 스크래퍼 수정 (DB 저장 + CSV 생성).
- [x] **UI Scaffolding**: Tailwind CSS 설정 및 기본 레이아웃 구성.
- [x] **Data Integration**:
    - [x] 오늘 날짜 기준 CSV 파일 Fetch 시도.
    - [x] 실패 시 Supabase DB Fallback 조회 구현.
- [x] **Dashboard Implementation**: 펀드 비교 리스트/테이블 UI 구현.
- [ ] **Deployment**: Vercel 배포 설정.

## Dev Log
- **2025-12-19**: 문서 생성. Vercel + Supabase 아키텍처 확정.
