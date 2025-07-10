"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, AlertCircle, CheckCircle, XCircle, Copy, Check, Globe, FileText, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"
import type {
  EOL,
  FRU,
  GPUCompatibility,
  OSCompatibility,
  KCCertification,
  SPM,
  OfficialSite,
} from "@/lib/database.types"

interface ProductData {
  eol: EOL[]
  fru: FRU[]
  gpucompatibility: GPUCompatibility[]
  oscompatibility: OSCompatibility[]
  kccertification: KCCertification[]
  spm: SPM[]
  officialsite: OfficialSite[]
}

function ProductInformationContent() {
  const [modelNames, setModelNames] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [selectedPartType, setSelectedPartType] = useState<string>("all")
  const [copiedSpm, setCopiedSpm] = useState<string | null>(null)
  const [productData, setProductData] = useState<ProductData>({
    eol: [],
    fru: [],
    gpucompatibility: [],
    oscompatibility: [],
    kccertification: [],
    spm: [],
    officialsite: [],
  })
  const [loading, setLoading] = useState(false)

  // 모든 테이블에서 모델명 가져오기
  useEffect(() => {
    const fetchModelNames = async () => {
      try {
        const tables = ["eol", "fru", "gpucompatibility", "oscompatibility", "kccertification", "spm", "officialsite"]
        const allModelNames = new Set<string>()

        for (const table of tables) {
          const { data, error } = await supabase.from(table).select("modelname")
          if (!error && data) {
            data.forEach((item: any) => {
              if (item.modelname) {
                allModelNames.add(item.modelname)
              }
            })
          }
        }

        const sortedModelNames = Array.from(allModelNames).sort()
        setModelNames(sortedModelNames)
      } catch (error) {
        console.error("Error fetching model names:", error)
      }
    }

    fetchModelNames()
  }, [])

  // 선택된 모델의 데이터 가져오기
  const fetchProductData = async (modelName: string) => {
    if (!modelName) return

    setLoading(true)
    try {
      const [eolData, fruData, gpuData, osData, kcData, spmData, officialData] = await Promise.all([
        supabase.from("eol").select("*").eq("modelname", modelName),
        supabase.from("fru").select("*").eq("modelname", modelName),
        supabase.from("gpucompatibility").select("*").eq("modelname", modelName),
        supabase.from("oscompatibility").select("*").eq("modelname", modelName),
        supabase.from("kccertification").select("*").eq("modelname", modelName),
        supabase.from("spm").select("*").eq("modelname", modelName),
        supabase.from("officialsite").select("*").eq("modelname", modelName),
      ])

      setProductData({
        eol: eolData.data || [],
        fru: fruData.data || [],
        gpucompatibility: gpuData.data || [],
        oscompatibility: osData.data || [],
        kccertification: kcData.data || [],
        spm: spmData.data || [],
        officialsite: officialData.data || [],
      })
    } catch (error) {
      console.error("Error fetching product data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setSelectedPartType("all") // 모델 변경시 파트타입 필터 초기화
    fetchProductData(modelName)
  }

  const handleCopySpm = async (spmName: string) => {
    try {
      await navigator.clipboard.writeText(spmName)
      setCopiedSpm(spmName)
      setTimeout(() => setCopiedSpm(null), 2000) // 2초 후 복사 상태 초기화
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleSipClick = () => {
    if (selectedModel) {
      const sipUrl = `https://sip.asus.com/tcweb/download_item_rma.aspx?model=${encodeURIComponent(selectedModel)}&product=5&type=Map&SLanguage=en-us&sn=flag`
      window.open(sipUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleOfficialLinkClick = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const getEOLStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>

    const statusLower = status.toLowerCase()
    if (statusLower.includes("eol") || statusLower.includes("discontinued")) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          EOL
        </Badge>
      )
    } else if (statusLower.includes("active") || statusLower.includes("current")) {
      return (
        <Badge variant="default">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    }
  }

  // FRU 데이터에서 파트타입 목록 추출
  const getPartTypes = () => {
    const partTypes = new Set<string>()
    productData.fru.forEach((item) => {
      if (item.item) {
        partTypes.add(item.item)
      }
    })
    return Array.from(partTypes).sort()
  }

  // 선택된 파트타입에 따라 FRU 데이터 필터링
  const getFilteredFRUData = () => {
    if (selectedPartType === "all") {
      return productData.fru
    }
    return productData.fru.filter((item) => item.item === selectedPartType)
  }

  // URL이 유효한지 확인하는 함수
  const isValidUrl = (url: string | null) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Product Information</h1>
        <p className="text-muted-foreground">서버 모델별 상세 정보를 확인하세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>모델 선택</CardTitle>
          <CardDescription>확인하고 싶은 서버 모델을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel} onValueChange={handleModelSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="모델을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {modelNames.map((modelName) => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedModel && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-semibold">{selectedModel}</h2>
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
          </div>

          {/* SIP - Service Information Portal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>SIP (Service Information Portal)</span>
              </CardTitle>
              <CardDescription>ASUS 서비스 정보 포털에서 해당 모델의 상세 정보를 확인하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSipClick} className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>SIP에서 {selectedModel} 정보 보기</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Official Page */}
          {productData.officialsite.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Official Page</span>
                </CardTitle>
                <CardDescription>공식 제품 페이지와 데이터시트를 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {productData.officialsite.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      {item.detailpage && (
                        <Button
                          onClick={() => handleOfficialLinkClick(item.detailpage)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Server Official Detail Page</span>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {item.datasheet && (
                        <Button
                          onClick={() => handleOfficialLinkClick(item.datasheet)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Datasheet</span>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KC Certification */}
          {productData.kccertification.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>KC 인증</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {productData.kccertification.map((item, index) => (
                    <div key={index}>
                      {item.kccertification && (
                        <a
                          href={item.kccertification}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>KC 인증서 보기</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SPM Information */}
          {productData.spm.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>담당자 정보</CardTitle>
                <CardDescription>담당자명을 클릭하면 복사됩니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {productData.spm.map((item, index) => (
                    <Button
                      key={index}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopySpm(item.spm || "")}
                      className="flex items-center space-x-1 cursor-pointer hover:bg-secondary/80"
                    >
                      <span>{item.spm}</span>
                      {copiedSpm === item.spm ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* EOL Information */}
          {productData.eol.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>EOL 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productData.eol.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">상태:</span>
                      {getEOLStatusBadge(item.status)}
                    </div>
                    {item.eolnotice && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">EOL 공지일:</span>
                        <span>{item.eolnotice}</span>
                      </div>
                    )}
                    {item.lastbuy && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">마지막 주문일:</span>
                        <span>{item.lastbuy}</span>
                      </div>
                    )}
                    {item.lastshipment && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">마지막 배송일:</span>
                        <span>{item.lastshipment}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* GPU Compatibility */}
          {productData.gpucompatibility.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>GPU 호환성 ({productData.gpucompatibility.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.gpucompatibility.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      {item.gpu && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">GPU:</span>
                          <Badge variant="default">{item.gpu}</Badge>
                        </div>
                      )}
                      {item.qty && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">수량:</span>
                          <span>{item.qty}개</span>
                        </div>
                      )}
                      {item.gputdp && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">전력 사용량:</span>
                          <Badge variant="secondary">{item.gputdp}W</Badge>
                        </div>
                      )}
                      {item.gpuarchitecture && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">아키텍처:</span>
                          <span>{item.gpuarchitecture}</span>
                        </div>
                      )}
                      {item.gpudetaileddescription && (
                        <div className="flex items-start space-x-2">
                          <span className="font-medium">상세 정보:</span>
                          <span className="flex-1">{item.gpudetaileddescription}</span>
                        </div>
                      )}
                      {item.gpucertifiedlink && isValidUrl(item.gpucertifiedlink) && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">인증 링크:</span>
                          <a
                            href={item.gpucertifiedlink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <span>NVIDIA 인증서</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OS Compatibility */}
          {productData.oscompatibility.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>OS 호환성 ({productData.oscompatibility.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.oscompatibility.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      {item.osversion && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">OS:</span>
                          <Badge variant="default">{item.osversion}</Badge>
                        </div>
                      )}
                      {item.formfactor && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">폼팩터:</span>
                          <span>{item.formfactor}</span>
                        </div>
                      )}
                      {item.oscpu && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">테스트 CPU:</span>
                          <span>{item.oscpu}</span>
                        </div>
                      )}
                      {item.ossupportstatement && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">인증 상태:</span>
                          <Badge variant="outline">{item.ossupportstatement}</Badge>
                        </div>
                      )}
                      {item.oscertificationlink && isValidUrl(item.oscertificationlink) && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">인증서 링크:</span>
                          <a
                            href={item.oscertificationlink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <span>OS 인증서</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FRU Information - 맨 아래로 이동 */}
          {productData.fru.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>FRU 정보 ({getFilteredFRUData().length}개)</CardTitle>
                <CardDescription>파트 타입별로 필터링하여 확인할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedPartType} onValueChange={setSelectedPartType}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="파트 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 보기 ({productData.fru.length}개)</SelectItem>
                      {getPartTypes().map((partType) => {
                        const count = productData.fru.filter((item) => item.item === partType).length
                        return (
                          <SelectItem key={partType} value={partType}>
                            {partType} ({count}개)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  {getFilteredFRUData().map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      {item.item && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">파트 타입:</span>
                          <Badge variant="outline">{item.item}</Badge>
                        </div>
                      )}
                      {item.pn && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">파트 번호:</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{item.pn}</code>
                        </div>
                      )}
                      {item.description && (
                        <div className="flex items-start space-x-2">
                          <span className="font-medium">설명:</span>
                          <span className="flex-1">{item.description}</span>
                        </div>
                      )}
                      {item.remark && (
                        <div className="flex items-start space-x-2">
                          <span className="font-medium">비고:</span>
                          <span className="flex-1 text-muted-foreground">{item.remark}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {Object.values(productData).every((arr) => arr.length === 0) && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">선택한 모델에 대한 정보가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProductInformationPage() {
  return (
    <AuthCheck>
      <ProductInformationContent />
    </AuthCheck>
  )
}
