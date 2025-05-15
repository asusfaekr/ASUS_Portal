-- 좋아요 테이블 생성
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  post_id INTEGER REFERENCES public.posts(id) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 좋아요 정책
CREATE POLICY "좋아요 조회 가능" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "자신의 좋아요만 삭제 가능" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자만 좋아요 가능" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
