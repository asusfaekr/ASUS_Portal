import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // CommonPart 샘플 데이터
    const commonPartsData = [
      // Server Chassis
      { model_name: "1U Rackmount Chassis", part_type: "Server Chassis", tdp: 0 },
      { model_name: "2U Rackmount Chassis", part_type: "Server Chassis", tdp: 0 },
      { model_name: "4U Rackmount Chassis", part_type: "Server Chassis", tdp: 0 },

      // CPU
      { model_name: "Intel Xeon Gold 6248", part_type: "CPU", tdp: 150 },
      { model_name: "AMD EPYC 7742", part_type: "CPU", tdp: 225 },
      { model_name: "Intel Xeon Platinum 8280", part_type: "CPU", tdp: 205 },
      { model_name: "AMD EPYC 7543", part_type: "CPU", tdp: 225 },

      // Memory
      { model_name: "32GB DDR4-3200 ECC", part_type: "Memory", tdp: 8 },
      { model_name: "64GB DDR4-3200 ECC", part_type: "Memory", tdp: 12 },
      { model_name: "32GB DDR5-4800 ECC", part_type: "Memory", tdp: 10 },
      { model_name: "64GB DDR5-5600 ECC", part_type: "Memory", tdp: 15 },

      // Disk
      { model_name: "1TB NVMe SSD Enterprise", part_type: "Disk", tdp: 7 },
      { model_name: "2TB NVMe SSD Enterprise", part_type: "Disk", tdp: 9 },
      { model_name: "4TB SATA SSD Enterprise", part_type: "Disk", tdp: 5 },
      { model_name: "8TB SATA HDD Enterprise", part_type: "Disk", tdp: 12 },

      // NIC
      { model_name: "10GbE Dual Port NIC", part_type: "NIC", tdp: 20 },
      { model_name: "25GbE Single Port NIC", part_type: "NIC", tdp: 15 },
      { model_name: "100GbE Single Port NIC", part_type: "NIC", tdp: 35 },

      // Add-on card
      { model_name: "RAID Controller Card", part_type: "Add-on card", tdp: 25 },
      { model_name: "Fibre Channel HBA", part_type: "Add-on card", tdp: 18 },
      { model_name: "NVMe Storage Card", part_type: "Add-on card", tdp: 30 },

      // Cooling
      { model_name: "120mm Server Fan", part_type: "Cooling", tdp: 15 },
      { model_name: "CPU Air Cooler", part_type: "Cooling", tdp: 8 },
      { model_name: "240mm AIO Liquid Cooler", part_type: "Cooling", tdp: 25 },
    ]

    // GPU 샘플 데이터
    const gpusData = [
      {
        model_name: "NVIDIA A100 80GB",
        tdp: 400,
        fp64_tf: 9.7,
        tf32_pf: 156,
        fp16_pf: 312,
        fp8_pf: 624,
        int8_pops: 1248,
        fp4_pf: 2496,
      },
      {
        model_name: "NVIDIA H100 80GB",
        tdp: 700,
        fp64_tf: 34,
        tf32_pf: 989,
        fp16_pf: 1979,
        fp8_pf: 3958,
        int8_pops: 7916,
        fp4_pf: 15832,
      },
      {
        model_name: "NVIDIA V100 32GB",
        tdp: 300,
        fp64_tf: 7.8,
        tf32_pf: 125,
        fp16_pf: 250,
        fp8_pf: 500,
        int8_pops: 1000,
        fp4_pf: 2000,
      },
      {
        model_name: "AMD Instinct MI250X",
        tdp: 560,
        fp64_tf: 47.9,
        tf32_pf: 383,
        fp16_pf: 766,
        fp8_pf: 1532,
        int8_pops: 3064,
        fp4_pf: 6128,
      },
    ]

    // 기존 데이터 삭제
    await supabase.from("common_parts").delete().neq("id", 0)
    await supabase.from("gpus").delete().neq("id", 0)

    // 새 데이터 삽입
    const { data: commonPartsResult, error: commonPartsError } = await supabase
      .from("common_parts")
      .insert(commonPartsData)
      .select()

    const { data: gpusResult, error: gpusError } = await supabase.from("gpus").insert(gpusData).select()

    if (commonPartsError || gpusError) {
      return NextResponse.json(
        {
          success: false,
          error: "데이터 삽입 중 오류가 발생했습니다.",
          details: commonPartsError?.message || gpusError?.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `${(commonPartsResult?.length || 0) + (gpusResult?.length || 0)}개의 부품 데이터가 성공적으로 추가되었습니다.`,
      commonParts: commonPartsResult?.length || 0,
      gpus: gpusResult?.length || 0,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다.", details: error.message },
      { status: 500 },
    )
  }
}
