'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Subject {
  id: string
  name: string
  slug: string
}

interface SubjectFilterProps {
  subjects: Subject[]
}

export function SubjectFilter({ subjects }: SubjectFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const currentSubjectId = searchParams.get("subjectId") || "all"

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set("subjectId", value)
    } else {
      params.delete("subjectId")
    }
    // Reset page when filter changes
    params.delete("page")
    
    router.push(`?${params.toString()}`)
  }

  if (!mounted) {
    return <div className="h-10 w-[180px] rounded-md border border-input bg-background" aria-hidden="true" />
  }

  return (
    <Select value={currentSubjectId} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="筛选科目" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">所有科目</SelectItem>
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
