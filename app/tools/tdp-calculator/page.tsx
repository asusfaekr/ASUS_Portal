"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Plus,
  Calculator,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Loader2,
  Network,
  Fan,
  PlusCircle,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CommonPart, GPU } from "@/lib/database.types"
import { AuthCheck } from "@/components/auth/auth-check"

interface Component {
  id: string
  category: string
  name: string
  tdp: number
  quantity: number
  specifications?: any
}

function TDPCalculatorContent() {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([])
  const [commonParts, setCommonParts] = useState<CommonPart[]>([])
  const [gpus, setGPUs] = useState<GPU[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedComponent, setSelectedComponent] = useState("")
  const [quantity, setQuantity] = useState(1)

  // 컴포넌트 카테고리
  const categories = [
    { value: "Server Chassis", label: "Server Chassis", icon: Server },
    { value: "CPU", label: "CPU", icon: Cpu },
    { value: "GPU", label: "GPU", icon: Server },
    { value: "Memory", label: "Memory", icon: MemoryStick },
    { value: "Disk", label: "Disk", icon: HardDrive },
    { value: "NIC", label: "NIC", icon: Network },
    { value: "Add-on card", label: "Add-on card", icon: PlusCircle },
    { value: "Cooling", label: "Cooling", icon: Fan },
  ]

  // 전기세 계산 함수 추가 (fetchComponents 함수 위에)
  const calculateElectricityCost = (tdp: number, years = 1) => {
    // 시간당 전기세: ₩130.24 (일반용전기(을))
    const hourlyRate = 130.24
    return (tdp / 1000) * hourlyRate * 24 * 365 * years
  }

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching components from Supabase...")

      // CommonPart 데이터 가져오기
      const { data: commonPartsData, error: commonPartsError } = await supabase
        .from("common_parts")
        .select("*")
        .order("part_type", { ascending: true })
        .order("model_name", { ascending: true })

      // GPU 데이터 가져오기
      const { data: gpusData, error: gpusError } = await supabase
        .from("gpus")
        .select("*")
        .order("model_name", { ascending: true })

      console.log("CommonParts data:", commonPartsData)
      console.log("GPUs data:", gpusData)
      console.log("CommonParts error:", commonPartsError)
      console.log("GPUs error:", gpusError)

      if (commonPartsError) {
        console.error("Error fetching common parts:", commonPartsError)
        setError(`CommonParts 테이블 오류: ${commonPartsError.message}`)
      }

      if (gpusError) {
        console.error("Error fetching GPUs:", gpusError)
        setError(`GPU 테이블 오류: ${gpusError.message}`)
      }

      // 데이터 설정
      setCommonParts(commonPartsData || [])
      setGPUs(gpusData || [])

      // 데이터 상태 확인
      const totalComponents = (commonPartsData?.length || 0) + (gpusData?.length || 0)
      if (totalComponents === 0) {
        setError("데이터베이스에 부품 정보가 없습니다. 관리자에게 문의하세요.")
      } else {
        console.log(`총 ${totalComponents}개의 부품을 로드했습니다.`)
        setError(null)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setError(`데이터 로드 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchComponents()
  }

  const addComponent = () => {
    if (!selectedCategory || !selectedComponent) return

    let component: any = null
    let componentData: Component

    if (selectedCategory === "GPU") {
      component = gpus.find((c) => c.id.toString() === selectedComponent)
      if (component) {
        componentData = {
          id: `gpu-${component.id}-${Date.now()}`,
          category: "GPU",
          name: component.model_name,
          tdp: component.tdp,
          quantity: quantity,
          specifications: {
            fp64_tf: component.fp64_tf,
            tf32_pf: component.tf32_pf,
            fp16_pf: component.fp16_pf,
            fp8_pf: component.fp8_pf,
            int8_pops: component.int8_pops,
            fp4_pf: component.fp4_pf,
          },
        }
      }
    } else {
      component = commonParts.find((c) => c.id.toString() === selectedComponent)
      if (component) {
        componentData = {
          id: `common-${component.id}-${Date.now()}`,
          category: component.part_type,
          name: component.model_name,
          tdp: component.tdp,
          quantity: quantity,
        }
      }
    }

    if (componentData) {
      setSelectedComponents([...selectedComponents, componentData])
      setSelectedComponent("")
      setQuantity(1)
    }
  }

  const removeComponent = (id: string) => {
    setSelectedComponents(selectedComponents.filter((c) => c.id !== id))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setSelectedComponents(selectedComponents.map((c) => (c.id === id ? { ...c, quantity: newQuantity } : c)))
  }

  const getTotalTDP = () => {
    return selectedComponents.reduce((total, component) => {
      return total + component.tdp * component.quantity
    }, 0)
  }

  const getFilteredComponents = () => {
    if (selectedCategory === "GPU") {
      return gpus.map((gpu) => ({ ...gpu, id: gpu.id.toString(), model_name: gpu.model_name }))
    } else {
      return commonParts
        .filter((c) => c.part_type === selectedCategory)
        .map((part) => ({ ...part, id: part.id.toString(), model_name: part.model_name }))
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find((c) => c.value === category)
    return categoryData ? categoryData.icon : Server
  }

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find((c) => c.value === category)
    return categoryData ? categoryData.label : category
  }

  const clearAll = () => {
    setSelectedComponents([])
  }

  const exportConfiguration = () => {
    try {
      const totalTDP = getTotalTDP()
      const yearlyElectricityCost = calculateElectricityCost(totalTDP)
      const fiveYearElectricityCost = calculateElectricityCost(totalTDP, 5)

      // Create CSV content with UTF-8 BOM
      let csvContent = "\uFEFF"

      // Header
      csvContent += "No.,Category,Component Name,Individual TDP (W),Quantity,Total TDP (W),Specifications\n"

      // Components data
      selectedComponents.forEach((component, index) => {
        const specs = component.specifications
          ? Object.entries(component.specifications)
              .filter(([key, value]) => value !== null && value !== undefined)
              .map(([key, value]) => `${key}: ${value}`)
              .join("; ")
          : "-"

        csvContent += `${index + 1},"${component.category}","${component.name}",${component.tdp},${component.quantity},${component.tdp * component.quantity},"${specs}"\n`
      })

      // Summary section
      csvContent += "\n\nPower Calculation Results\n"
      csvContent += "Item,Value\n"
      csvContent += `Total TDP,${totalTDP}W\n`
      csvContent += `Recommended PSU Capacity (80% efficiency),${Math.ceil(totalTDP / 0.8)}W\n`
      csvContent += `Hourly Power Consumption,${(totalTDP / 1000).toFixed(2)}kWh\n`
      csvContent += `Daily Power Consumption (24 hours),${((totalTDP * 24) / 1000).toFixed(2)}kWh\n`
      csvContent += `Monthly Power Consumption (30 days),${((totalTDP * 24 * 30) / 1000).toFixed(2)}kWh\n`
      csvContent += `Annual Power Consumption (365 days),${((totalTDP * 24 * 365) / 1000).toFixed(0)}kWh\n`
      csvContent += `Electricity Rate Basis,General Electric Rate (B) KRW 130.24 per hour\n`
      csvContent += `Annual Electricity Cost,KRW ${Math.round(yearlyElectricityCost)}\n`
      csvContent += `5-Year Electricity Cost,KRW ${Math.round(fiveYearElectricityCost)}\n`

      // Create and download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `Server_Configuration_TDP_Calculator_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      console.log("CSV file exported successfully")
    } catch (error) {
      console.error("CSV export error:", error)
      alert("An error occurred while exporting the file.")
    }
  }

  // 카테고리별 컴포넌트 그룹화
  const getComponentsByCategory = () => {
    const grouped = {}
    categories.forEach((cat) => {
      grouped[cat.value] = selectedComponents.filter((comp) => comp.category === cat.value)
    })
    return grouped
  }

  // 카테고리별 사용 가능한 부품 수 계산
  const getAvailableComponentsCount = (categoryValue: string) => {
    if (categoryValue === "GPU") {
      return gpus.length
    } else {
      return commonParts.filter((c) => c.part_type === categoryValue).length
    }
  }

  if (loading) {
    return (
      <div className="container py-10 max-w-6xl mx-auto">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Supabase에서 부품 데이터를 로드하는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const componentsByCategory = getComponentsByCategory()

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">TDP Calculator</h1>
            <p className="text-muted-foreground">서버 부품을 선택하여 총 전력 소비량(TDP)을 계산하세요</p>
          </div>
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            데이터 새로고침
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 데이터 상태 표시 */}
      <div className="mb-6">
        <div className="text-center mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>전기세 계산 기준:</strong> 일반용전기(을) 시간당 요금 ₩130.24
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getTotalTDP()}W</div>
                <div className="text-sm text-muted-foreground">총 TDP</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₩
                  {getTotalTDP() > 0
                    ? calculateElectricityCost(getTotalTDP()).toLocaleString("ko-KR", { maximumFractionDigits: 0 })
                    : "0"}
                </div>
                <div className="text-sm text-muted-foreground">연간 전기세</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  ₩
                  {getTotalTDP() > 0
                    ? calculateElectricityCost(getTotalTDP(), 5).toLocaleString("ko-KR", { maximumFractionDigits: 0 })
                    : "0"}
                </div>
                <div className="text-sm text-muted-foreground">5년간 전기세</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 부품 선택 패널 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              부품 추가
            </CardTitle>
            <CardDescription>서버에 사용할 부품을 선택하고 추가하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="부품 카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon
                    const count = getAvailableComponentsCount(category.value)
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Label htmlFor="component">부품</Label>
                <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="부품을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredComponents().map((component) => (
                      <SelectItem key={component.id} value={component.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{component.model_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {selectedCategory === "GPU" ? `${(component as any).tdp}W` : `${component.tdp}W`}
                            {selectedCategory === "GPU" && (component as any).fp64_tf && (
                              <span className="ml-2">FP64: {(component as any).fp64_tf}TF</span>
                            )}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedComponent && (
              <div className="space-y-2">
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            )}

            <Button onClick={addComponent} disabled={!selectedCategory || !selectedComponent} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              부품 추가
            </Button>
          </CardContent>
        </Card>

        {/* 선택된 부품 목록 및 계산 결과 */}
        <div className="space-y-6">
          {/* 선택된 부품 목록 - 카테고리별로 그룹화 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    선택된 부품
                  </CardTitle>
                  <CardDescription>현재 구성된 서버 부품 목록</CardDescription>
                </div>
                {selectedComponents.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    전체 삭제
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p>선택된 부품이 없습니다.</p>
                  <p className="text-sm">왼쪽에서 부품을 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {categories.map((category) => {
                    const categoryComponents = componentsByCategory[category.value]
                    if (categoryComponents.length === 0) return null

                    const Icon = category.icon
                    return (
                      <div key={category.value} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          {category.label}
                          <Badge variant="outline">{categoryComponents.length}</Badge>
                        </div>
                        <div className="space-y-2 pl-6">
                          {categoryComponents.map((component) => (
                            <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{component.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {component.tdp}W × {component.quantity} = {component.tdp * component.quantity}W
                                  {component.specifications && component.category === "GPU" && (
                                    <div className="text-xs mt-1 space-y-1">
                                      {component.specifications.fp64_tf && (
                                        <div>FP64: {component.specifications.fp64_tf}TF</div>
                                      )}
                                      {component.specifications.tf32_pf && (
                                        <div>TF32: {component.specifications.tf32_pf}PF</div>
                                      )}
                                      {component.specifications.fp16_pf && (
                                        <div>FP16: {component.specifications.fp16_pf}PF</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={component.quantity}
                                  onChange={(e) => updateQuantity(component.id, Number(e.target.value))}
                                  className="w-16 h-8"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeComponent(component.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 계산 결과 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  전력 계산 결과
                </CardTitle>
                {selectedComponents.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportConfiguration}>
                    CSV로 내보내기
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>총 TDP:</span>
                  <span className="text-blue-600">{getTotalTDP()}W</span>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>권장 PSU 용량 (80% 효율):</span>
                    <span className="font-medium">{Math.ceil(getTotalTDP() / 0.8)}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>시간당 전력 소비량:</span>
                    <span className="font-medium">{(getTotalTDP() / 1000).toFixed(2)}kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>일일 전력 소비량 (24시간):</span>
                    <span className="font-medium">{((getTotalTDP() * 24) / 1000).toFixed(2)}kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>월간 전력 소비량 (30일):</span>
                    <span className="font-medium">{((getTotalTDP() * 24 * 30) / 1000).toFixed(2)}kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>연간 전력 소비량 (365일):</span>
                    <span className="font-medium">{((getTotalTDP() * 24 * 365) / 1000).toFixed(0)}kWh</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function TDPCalculatorPage() {
  return (
    <AuthCheck>
      <TDPCalculatorContent />
    </AuthCheck>
  )
}
