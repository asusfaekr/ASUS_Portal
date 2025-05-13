-- 역할 테이블 생성
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company TEXT,
  position TEXT,
  role_id INTEGER REFERENCES public.roles(id),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS public.boards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  role_id INTEGER REFERENCES public.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  board_id INTEGER REFERENCES public.boards(id),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER REFERENCES public.posts(id),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인증 토큰 테이블 생성
CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 역할 추가
INSERT INTO public.roles (id, name, description)
VALUES 
  (1, 'FAE', 'Field Application Engineer'),
  (2, 'Sales', 'Sales Team'),
  (3, 'Marketing', 'Marketing Team')
ON CONFLICT (id) DO NOTHING;

-- 기본 게시판 추가
INSERT INTO public.boards (name, slug, description, role_id)
VALUES 
  ('공지사항', 'announcements', '공지사항 게시판', NULL),
  ('FAE 기술 업데이트', 'fae-technical-updates', 'FAE 기술 업데이트 게시판', 1),
  ('FAE 리소스', 'fae-resources', 'FAE 리소스 게시판', 1),
  ('Sales 기회', 'sales-opportunities', 'Sales 기회 게시판', 2),
  ('Sales 리소스', 'sales-resources', 'Sales 리소스 게시판', 2),
  ('Marketing 캠페인', 'marketing-campaigns', 'Marketing 캠페인 게시판', 3),
  ('Marketing 리소스', 'marketing-resources', 'Marketing 리소스 게시판', 3)
ON CONFLICT (slug) DO NOTHING;

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 사용자 정책: 자신의 프로필만 수정 가능, 모든 프로필 조회 가능
CREATE POLICY "프로필 조회 가능" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "자신의 프로필만 수정 가능" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 게시판 정책: 모든 게시판 조회 가능
CREATE POLICY "게시판 조회 가능" ON public.boards
  FOR SELECT USING (true);

-- 게시글 정책: 모든 게시글 조회 가능, 자신의 게시글만 수정/삭제 가능
CREATE POLICY "게시글 조회 가능" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "자신의 게시글만 수정 가능" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "자신의 게시글만 삭제 가능" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자만 게시글 작성 가능" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 댓글 정책
CREATE POLICY "댓글 조회 가능" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "자신의 댓글만 수정 가능" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "자신의 댓글만 삭제 가능" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자만 댓글 작성 가능" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 트리거: 사용자 생성 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
