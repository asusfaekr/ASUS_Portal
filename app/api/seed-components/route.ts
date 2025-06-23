import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 먼저 테이블이 존재하는지 확인
    const { data: tableExists, error: tableError } = await supabase.from("server_components").select("id").limit(1)

    if (tableError) {
      return NextResponse.json(
        {
          success: false,
          error: "server_components 테이블이 존재하지 않습니다. 먼저 마이그레이션을 실행해주세요.",
          details: tableError.message,
        },
        { status: 400 },
      )
    }

    // 샘플 데이터
    const sampleComponents = [
      // CPU
      {
        category: "cpu",
        name: "Intel Xeon",
        model: "E5-2690 v4",
        manufacturer: "Intel",
        tdp_watts: 135,
        specifications: { cores: 14, threads: 28, base_clock: "2.6GHz", max_clock: "3.5GHz" },
      },
      {
        category: "cpu",
        name: "AMD EPYC",
        model: "7742",
        manufacturer: "AMD",
        tdp_watts: 225,
        specifications: { cores: 64, threads: 128, base_clock: "2.25GHz", max_clock: "3.4GHz" },
      },
      {
        category: "cpu",
        name: "Intel Xeon",
        model: "Gold 6248",
        manufacturer: "Intel",
        tdp_watts: 150,
        specifications: { cores: 20, threads: 40, base_clock: "2.5GHz", max_clock: "3.9GHz" },
      },
      {
        category: "cpu",
        name: "AMD EPYC",
        model: "7543",
        manufacturer: "AMD",
        tdp_watts: 225,
        specifications: { cores: 32, threads: 64, base_clock: "2.8GHz", max_clock: "3.7GHz" },
      },

      // GPU
      {
        category: "gpu",
        name: "NVIDIA Tesla",
        model: "V100",
        manufacturer: "NVIDIA",
        tdp_watts: 300,
        specifications: { memory: "32GB HBM2", cuda_cores: 5120, tensor_cores: 640 },
      },
      {
        category: "gpu",
        name: "NVIDIA A100",
        model: "80GB",
        manufacturer: "NVIDIA",
        tdp_watts: 400,
        specifications: { memory: "80GB HBM2e", tensor_cores: 432, rt_cores: 0 },
      },
      {
        category: "gpu",
        name: "NVIDIA H100",
        model: "80GB",
        manufacturer: "NVIDIA",
        tdp_watts: 700,
        specifications: { memory: "80GB HBM3", tensor_cores: 528, transformer_engine: true },
      },
      {
        category: "gpu",
        name: "AMD Instinct",
        model: "MI250X",
        manufacturer: "AMD",
        tdp_watts: 560,
        specifications: { memory: "128GB HBM2e", compute_units: 220, matrix_cores: 1760 },
      },

      // Memory
      {
        category: "memory",
        name: "DDR4 ECC",
        model: "32GB 2933MHz",
        manufacturer: "Samsung",
        tdp_watts: 8,
        specifications: { capacity: "32GB", speed: "2933MHz", type: "ECC", voltage: "1.2V" },
      },
      {
        category: "memory",
        name: "DDR4 ECC",
        model: "64GB 3200MHz",
        manufacturer: "Micron",
        tdp_watts: 12,
        specifications: { capacity: "64GB", speed: "3200MHz", type: "ECC", voltage: "1.2V" },
      },
      {
        category: "memory",
        name: "DDR5 ECC",
        model: "32GB 4800MHz",
        manufacturer: "Samsung",
        tdp_watts: 10,
        specifications: { capacity: "32GB", speed: "4800MHz", type: "ECC", voltage: "1.1V" },
      },
      {
        category: "memory",
        name: "DDR5 ECC",
        model: "64GB 5600MHz",
        manufacturer: "SK Hynix",
        tdp_watts: 15,
        specifications: { capacity: "64GB", speed: "5600MHz", type: "ECC", voltage: "1.1V" },
      },

      // Storage
      {
        category: "storage",
        name: "NVMe SSD",
        model: "1TB Enterprise",
        manufacturer: "Samsung",
        tdp_watts: 7,
        specifications: { capacity: "1TB", interface: "NVMe", type: "Enterprise", read_speed: "7000MB/s" },
      },
      {
        category: "storage",
        name: "NVMe SSD",
        model: "2TB Enterprise",
        manufacturer: "Intel",
        tdp_watts: 9,
        specifications: { capacity: "2TB", interface: "NVMe", type: "Enterprise", read_speed: "6500MB/s" },
      },
      {
        category: "storage",
        name: "SATA SSD",
        model: "4TB Enterprise",
        manufacturer: "Micron",
        tdp_watts: 5,
        specifications: { capacity: "4TB", interface: "SATA", type: "Enterprise", read_speed: "550MB/s" },
      },
      {
        category: "storage",
        name: "HDD",
        model: "8TB Enterprise",
        manufacturer: "Seagate",
        tdp_watts: 12,
        specifications: { capacity: "8TB", interface: "SATA", type: "Enterprise", rpm: "7200" },
      },

      // Motherboard
      {
        category: "motherboard",
        name: "Server Motherboard",
        model: "Dual Socket LGA3647",
        manufacturer: "ASUS",
        tdp_watts: 50,
        specifications: { sockets: 2, memory_slots: 16, pcie_slots: 8, form_factor: "E-ATX" },
      },
      {
        category: "motherboard",
        name: "Server Motherboard",
        model: "Single Socket SP3",
        manufacturer: "Supermicro",
        tdp_watts: 35,
        specifications: { sockets: 1, memory_slots: 8, pcie_slots: 4, form_factor: "ATX" },
      },
      {
        category: "motherboard",
        name: "Server Motherboard",
        model: "Quad Socket",
        manufacturer: "HPE",
        tdp_watts: 80,
        specifications: { sockets: 4, memory_slots: 32, pcie_slots: 16, form_factor: "Proprietary" },
      },

      // PSU
      {
        category: "psu",
        name: "Server PSU",
        model: "1600W 80+ Platinum",
        manufacturer: "Seasonic",
        tdp_watts: 0,
        specifications: { capacity: "1600W", efficiency: "80+ Platinum", modular: true, redundant: false },
      },
      {
        category: "psu",
        name: "Server PSU",
        model: "2000W 80+ Titanium",
        manufacturer: "Delta",
        tdp_watts: 0,
        specifications: { capacity: "2000W", efficiency: "80+ Titanium", modular: true, redundant: true },
      },
      {
        category: "psu",
        name: "Server PSU",
        model: "3000W 80+ Gold",
        manufacturer: "FSP",
        tdp_watts: 0,
        specifications: { capacity: "3000W", efficiency: "80+ Gold", modular: false, redundant: true },
      },

      // Cooling
      {
        category: "cooling",
        name: "Server Fan",
        model: "120mm High Performance",
        manufacturer: "Noctua",
        tdp_watts: 15,
        specifications: { size: "120mm", rpm: "3000", noise: "25dB", airflow: "150CFM" },
      },
      {
        category: "cooling",
        name: "CPU Cooler",
        model: "Server Grade Air Cooler",
        manufacturer: "Cooler Master",
        tdp_watts: 8,
        specifications: { type: "Air", height: "165mm", tdp_support: "250W", noise: "30dB" },
      },
      {
        category: "cooling",
        name: "Liquid Cooling",
        model: "AIO 240mm",
        manufacturer: "Corsair",
        tdp_watts: 25,
        specifications: { type: "Liquid", radiator: "240mm", tdp_support: "350W", noise: "35dB" },
      },

      // Network
      {
        category: "network",
        name: "Network Card",
        model: "10GbE Dual Port",
        manufacturer: "Intel",
        tdp_watts: 20,
        specifications: { ports: 2, speed: "10GbE", interface: "PCIe", protocol: "Ethernet" },
      },
      {
        category: "network",
        name: "Network Card",
        model: "25GbE Single Port",
        manufacturer: "Mellanox",
        tdp_watts: 15,
        specifications: { ports: 1, speed: "25GbE", interface: "PCIe", protocol: "Ethernet" },
      },
      {
        category: "network",
        name: "Network Card",
        model: "100GbE Single Port",
        manufacturer: "Broadcom",
        tdp_watts: 35,
        specifications: { ports: 1, speed: "100GbE", interface: "PCIe", protocol: "Ethernet" },
      },
    ]

    // 기존 데이터 삭제 (선택사항)
    await supabase.from("server_components").delete().neq("id", 0)

    // 새 데이터 삽입
    const { data, error } = await supabase.from("server_components").insert(sampleComponents).select()

    if (error) {
      return NextResponse.json(
        { success: false, error: "데이터 삽입 중 오류가 발생했습니다.", details: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `${data.length}개의 서버 부품 데이터가 성공적으로 추가되었습니다.`,
      count: data.length,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다.", details: error.message },
      { status: 500 },
    )
  }
}
