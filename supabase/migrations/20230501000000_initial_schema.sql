-- 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  category TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) NOT NULL
);

-- 좋아요 테이블 생성
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- 사용자 통계 업데이트 함수
CREATE OR REPLACE FUNCTION increment_user_stats(
  user_id UUID,
  points_to_add INTEGER,
  posts_to_add INTEGER DEFAULT 0,
  comments_to_add INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
  current_points INTEGER;
  current_level INTEGER;
  next_level_threshold INTEGER;
BEGIN
  -- 현재 포인트와 레벨 가져오기
  SELECT points, level INTO current_points, current_level
  FROM public.profiles
  WHERE id = user_id;
  
  -- 포인트 및 카운트 업데이트
  UPDATE public.profiles
  SET 
    points = points + points_to_add,
    posts_count = posts_count + posts_to_add,
    comments_count = comments_count + comments_to_add,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- 레벨 업 체크 및 업데이트
  current_points := current_points + points_to_add;
  next_level_threshold := current_level * 500; -- 다음 레벨 임계값 (레벨 * 500)
  
  IF current_points >= next_level_threshold AND current_level < 6 THEN
    UPDATE public.profiles
    SET level = level + 1
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 자신의 프로필만 수정 가능, 모든 프로필 조회 가능
CREATE POLICY "프로필 조회 가능" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "자신의 프로필만 수정 가능" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 게시글 정책: 모든 게시글 조회 가능, 자신의 게시글만 수정/삭제 가능
CREATE POLICY "게시글 조회 가능" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "자신의 게시글만 수정 가능" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "자신의 게시글만 삭제 가능" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "인증된 사용자만 게시글 작성 가능" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 댓글 정책
CREATE POLICY "댓글 조회 가능" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "자신의 댓글만 수정 가능" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "자신의 댓글만 삭제 가능" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "인증된 사용자만 댓글 작성 가능" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 좋아요 정책
CREATE POLICY "좋아요 조회 가능" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "자신의 좋아요만 삭제 가능" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "인증된 사용자만 좋아요 가능" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 트리거: 사용자 생성 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
