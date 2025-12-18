# 02. Web UI Development

## Context
- **목표**: 스크래퍼가 수집한 ETF/Fund 비교 데이터를 시각화하는 웹 인터페이스 개발.
- **핵심 제약**: 운영 비용 0원 (Free Tier 활용).
- **타겟 유저**: 저비용 인덱스 펀드를 찾는 투자자.

## Design

### Architecture: Vercel + Supabase
"무료 운영" 목표를 달성하기 위해 Vercel과 Supabase의 Free Tier를 조합합니다.

1.  **Hosting**: **Vercel** (Free).
    - React/Next.js 프로젝트 배포에 최적화.
    - 빠른 글로벌 CDN 제공.
2.  **Database**: **Supabase** (Free).
    - PostgreSQL 기반의 BaaS.
    - Github Actions에서 Python 스크립트로 데이터 적재 용이.
    - 프론트엔드에서 `supabase-js` 클라이언트로 직접 조회 가능 (별도 백엔드 API 서버 불필요).
3.  **Automation (ETL)**:
    - **GitHub Actions**:
        1.  Scraper 실행 (매일 정기).
        2.  수집된 데이터를 Supabase DB에 Upsert (Insert/Update).

### Tech Stack
- **Framework**: React (Vite) - 가볍고 빠른 개발 환경.
- **Language**: TypeScript - 유지보수성 확보.
- **Styling**: Tailwind CSS - 빠르고 일관된 UI 디자인.
- **Database Client**: `supabase-js` & `supabase-py` (Python 스크래퍼용).
- **Visualization**: Recharts 또는 TanStack Table (데이터 그리드).

### Folder Structure
```
/web
  /src
    /components
    /lib (supabase client setup)
    /hooks (useFundData)
    /types
    App.tsx
```

## Todo List
- [x] **Project Setup**: `web/` 디렉토리에 React + Vite + TypeScript 프로젝트 생성.
- [ ] **Infrastructure**: Supabase 프로젝트 생성 및 테이블 스키마 설계 (`funds` 테이블).
- [ ] **Data Pipeline Update**: 기존 파이썬 스크래퍼에 Supabase 연동 로직 추가 (CSV 저장 방식 -> DB 저장 방식).
- [x] **UI Scaffolding**: Tailwind CSS 설정 및 기본 레이아웃 (Header, Main, Footer) 구성.
- [x] **Data Integration**: 프론트엔드에서 Supabase 데이터 조회 (`select *`) 구현. (Fallback with Mock Data implemented)
- [x] **Dashboard Implementation**: 펀드 비교 리스트/테이블 UI 구현.
- [ ] **Deployment**: Vercel 배포 설정.

## Dev Log
- **2025-12-19**: 문서 생성. Vercel + Supabase 아키텍처 확정.
