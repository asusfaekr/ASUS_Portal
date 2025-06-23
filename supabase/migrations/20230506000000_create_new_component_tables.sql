-- 기존 server_components 테이블 삭제 (필요한 경우)
DROP TABLE IF EXISTS public.server_components CASCADE;

-- CommonPart 테이블 생성
CREATE TABLE IF NOT EXISTS public.common_parts (
  id SERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  part_type TEXT NOT NULL, -- Server Chassis, CPU, Memory, Disk, NIC, Add-on card, Cooling
  tdp INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPU 테이블 생성
CREATE TABLE IF NOT EXISTS public.gpus (
  id SERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  tdp INTEGER NOT NULL,
  fp64_tf DECIMAL(10,2), -- FP64 (TF)
  tf32_pf DECIMAL(10,2), -- TF32 (PF)
  fp16_pf DECIMAL(10,2), -- FP16 (PF)
  fp8_pf DECIMAL(10,2),  -- FP8 (PF)
  int8_pops DECIMAL(10,2), -- INT8 (POPS)
  fp4_pf DECIMAL(10,2),  -- FP4 (PF)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_common_parts_part_type ON public.common_parts(part_type);
CREATE INDEX IF NOT EXISTS idx_common_parts_model_name ON public.common_parts(model_name);
CREATE INDEX IF NOT EXISTS idx_gpus_model_name ON public.gpus(model_name);

-- RLS(Row Level Security) 정책 설정
ALTER TABLE public.common_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpus ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "CommonPart 조회 가능" ON public.common_parts
  FOR SELECT USING (true);

CREATE POLICY "GPU 조회 가능" ON public.gpus
  FOR SELECT USING (true);

-- 인증된 사용자만 추가/수정/삭제 가능 (관리자용)
CREATE POLICY "인증된 사용자만 CommonPart 관리 가능" ON public.common_parts
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "인증된 사용자만 GPU 관리 가능" ON public.gpus
  FOR ALL USING (auth.uid() IS NOT NULL);
