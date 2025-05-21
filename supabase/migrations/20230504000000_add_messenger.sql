-- 메시지 테이블 생성
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  receiver_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지 정책 설정
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 메시지 조회 정책 (자신이 보낸 메시지 또는 받은 메시지만 조회 가능)
CREATE POLICY "메시지 조회 가능" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 메시지 작성 정책 (자신만 메시지 작성 가능)
CREATE POLICY "메시지 작성 가능" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 메시지 업데이트 정책 (받은 메시지만 읽음 상태 업데이트 가능)
CREATE POLICY "메시지 업데이트 가능" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);
