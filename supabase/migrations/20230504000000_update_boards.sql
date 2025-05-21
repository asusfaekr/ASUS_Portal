-- 기존 게시판 데이터 업데이트
UPDATE public.boards
SET slug = 'announcements', name = '공지사항', description = '공지사항 게시판'
WHERE id = 1;

UPDATE public.boards
SET slug = 'fae-technical-updates', name = 'FAE 기술 업데이트', description = 'FAE 기술 업데이트 게시판', role_id = 1
WHERE id = 2;

UPDATE public.boards
SET slug = 'fae-resources', name = 'FAE 리소스', description = 'FAE 리소스 게시판', role_id = 1
WHERE id = 3;

UPDATE public.boards
SET slug = 'sales-opportunities', name = 'Sales 기회', description = 'Sales 기회 게시판', role_id = 2
WHERE id = 4;

-- 추가 게시판 생성
INSERT INTO public.boards (name, slug, description, role_id, created_at, updated_at)
VALUES 
  ('Sales 리소스', 'sales-resources', 'Sales 리소스 게시판', 2, NOW(), NOW()),
  ('Marketing 캠페인', 'marketing-campaigns', 'Marketing 캠페인 게시판', 3, NOW(), NOW()),
  ('Marketing 리소스', 'marketing-resources', 'Marketing 리소스 게시판', 3, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
