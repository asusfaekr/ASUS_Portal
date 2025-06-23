-- 서버 부품 정보를 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS public.server_components (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT,
  tdp_watts INTEGER NOT NULL,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_server_components_category ON public.server_components(category);
CREATE INDEX IF NOT EXISTS idx_server_components_manufacturer ON public.server_components(manufacturer);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.server_components ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "서버 부품 조회 가능" ON public.server_components
  FOR SELECT USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자용)
CREATE POLICY "인증된 사용자만 서버 부품 관리 가능" ON public.server_components
  FOR ALL USING (auth.uid() IS NOT NULL);
