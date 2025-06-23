-- 서버 부품 정보를 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS public.server_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- cpu, gpu, memory, storage, motherboard, psu, cooling, network
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  manufacturer TEXT,
  tdp_watts INTEGER NOT NULL,
  specifications JSONB,
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

-- 샘플 데이터 추가
INSERT INTO public.server_components (category, name, model, manufacturer, tdp_watts, specifications) VALUES
-- CPU
('cpu', 'Intel Xeon', 'E5-2690 v4', 'Intel', 135, '{"cores": 14, "threads": 28, "base_clock": "2.6GHz", "max_clock": "3.5GHz"}'),
('cpu', 'AMD EPYC', '7742', 'AMD', 225, '{"cores": 64, "threads": 128, "base_clock": "2.25GHz", "max_clock": "3.4GHz"}'),
('cpu', 'Intel Xeon', 'Gold 6248', 'Intel', 150, '{"cores": 20, "threads": 40, "base_clock": "2.5GHz", "max_clock": "3.9GHz"}'),
('cpu', 'AMD EPYC', '7543', 'AMD', 225, '{"cores": 32, "threads": 64, "base_clock": "2.8GHz", "max_clock": "3.7GHz"}'),

-- GPU
('gpu', 'NVIDIA Tesla', 'V100', 'NVIDIA', 300, '{"memory": "32GB HBM2", "cuda_cores": 5120, "tensor_cores": 640}'),
('gpu', 'NVIDIA A100', '80GB', 'NVIDIA', 400, '{"memory": "80GB HBM2e", "tensor_cores": 432, "rt_cores": 0}'),
('gpu', 'NVIDIA H100', '80GB', 'NVIDIA', 700, '{"memory": "80GB HBM3", "tensor_cores": 528, "transformer_engine": true}'),
('gpu', 'AMD Instinct', 'MI250X', 'AMD', 560, '{"memory": "128GB HBM2e", "compute_units": 220, "matrix_cores": 1760}'),

-- Memory
('memory', 'DDR4 ECC', '32GB 2933MHz', 'Samsung', 8, '{"capacity": "32GB", "speed": "2933MHz", "type": "ECC", "voltage": "1.2V"}'),
('memory', 'DDR4 ECC', '64GB 3200MHz', 'Micron', 12, '{"capacity": "64GB", "speed": "3200MHz", "type": "ECC", "voltage": "1.2V"}'),
('memory', 'DDR5 ECC', '32GB 4800MHz', 'Samsung', 10, '{"capacity": "32GB", "speed": "4800MHz", "type": "ECC", "voltage": "1.1V"}'),
('memory', 'DDR5 ECC', '64GB 5600MHz', 'SK Hynix', 15, '{"capacity": "64GB", "speed": "5600MHz", "type": "ECC", "voltage": "1.1V"}'),

-- Storage
('storage', 'NVMe SSD', '1TB Enterprise', 'Samsung', 7, '{"capacity": "1TB", "interface": "NVMe", "type": "Enterprise", "read_speed": "7000MB/s"}'),
('storage', 'NVMe SSD', '2TB Enterprise', 'Intel', 9, '{"capacity": "2TB", "interface": "NVMe", "type": "Enterprise", "read_speed": "6500MB/s"}'),
('storage', 'SATA SSD', '4TB Enterprise', 'Micron', 5, '{"capacity": "4TB", "interface": "SATA", "type": "Enterprise", "read_speed": "550MB/s"}'),
('storage', 'HDD', '8TB Enterprise', 'Seagate', 12, '{"capacity": "8TB", "interface": "SATA", "type": "Enterprise", "rpm": "7200"}'),

-- Motherboard
('motherboard', 'Server Motherboard', 'Dual Socket LGA3647', 'ASUS', 50, '{"sockets": 2, "memory_slots": 16, "pcie_slots": 8, "form_factor": "E-ATX"}'),
('motherboard', 'Server Motherboard', 'Single Socket SP3', 'Supermicro', 35, '{"sockets": 1, "memory_slots": 8, "pcie_slots": 4, "form_factor": "ATX"}'),
('motherboard', 'Server Motherboard', 'Quad Socket', 'HPE', 80, '{"sockets": 4, "memory_slots": 32, "pcie_slots": 16, "form_factor": "Proprietary"}'),

-- PSU
('psu', 'Server PSU', '1600W 80+ Platinum', 'Seasonic', 0, '{"capacity": "1600W", "efficiency": "80+ Platinum", "modular": true, "redundant": false}'),
('psu', 'Server PSU', '2000W 80+ Titanium', 'Delta', 0, '{"capacity": "2000W", "efficiency": "80+ Titanium", "modular": true, "redundant": true}'),
('psu', 'Server PSU', '3000W 80+ Gold', 'FSP', 0, '{"capacity": "3000W", "efficiency": "80+ Gold", "modular": false, "redundant": true}'),

-- Cooling
('cooling', 'Server Fan', '120mm High Performance', 'Noctua', 15, '{"size": "120mm", "rpm": "3000", "noise": "25dB", "airflow": "150CFM"}'),
('cooling', 'CPU Cooler', 'Server Grade Air Cooler', 'Cooler Master', 8, '{"type": "Air", "height": "165mm", "tdp_support": "250W", "noise": "30dB"}'),
('cooling', 'Liquid Cooling', 'AIO 240mm', 'Corsair', 25, '{"type": "Liquid", "radiator": "240mm", "tdp_support": "350W", "noise": "35dB"}'),

-- Network
('network', 'Network Card', '10GbE Dual Port', 'Intel', 20, '{"ports": 2, "speed": "10GbE", "interface": "PCIe", "protocol": "Ethernet"}'),
('network', 'Network Card', '25GbE Single Port', 'Mellanox', 15, '{"ports": 1, "speed": "25GbE", "interface": "PCIe", "protocol": "Ethernet"}'),
('network', 'Network Card', '100GbE Single Port', 'Broadcom', 35, '{"ports": 1, "speed": "100GbE", "interface": "PCIe", "protocol": "Ethernet"}');
