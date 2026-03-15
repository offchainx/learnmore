'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { getKnowledgeGraphData } from '@/actions/courses/knowledge'
import { getCategories } from '@/actions/community/post'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageBadgeClass,
  pageEmptyStateClass,
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageShellFrameClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardTitleClass,
  pageKickerClass,
  pageMetaTextClass,
  pageSectionDescriptionClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'
import {
  BookOpen, Target, ChevronRight,
  Layers, Zap, Loader2
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// --- Dagre Layout Setup ---
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 200
const nodeHeight = 80

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? Position.Left : Position.Top
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

    // We are shifting the dagre node position (center) to the top left
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  return { nodes, edges }
}

// --- Custom Node Component ---
const KnowledgeNode = ({ data }: NodeProps) => {
  const isMastered = data.status === 'mastered'
  const isStarted = data.status === 'started'
  
  return (
    <div className={`
      relative px-4 py-3 rounded-xl border transition-all duration-300 w-[200px]
      ${isMastered 
        ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
        : isStarted 
          ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'bg-slate-900/80 border-slate-800 opacity-80'}
    `}>
      <Handle type="target" position={Position.Left} className="!bg-slate-600 !w-2 !h-2" />
      
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <h4 className="text-[12px] font-bold text-slate-100 truncate w-full pr-4">{data.label as string}</h4>
          {isMastered && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500 absolute top-3 right-3" />}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${isMastered ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${data.mastery}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{String(data.mastery)}%</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-slate-600 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = {
  knowledgeNode: KnowledgeNode,
}

export const KnowledgeGraphView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [graphData, categories] = await Promise.all([
        getKnowledgeGraphData(selectedSubjectId || undefined),
        getCategories()
      ])
      
      setSubjects(categories)
      if (!selectedSubjectId && categories.length > 0) {
        setSelectedSubjectId(categories[0].id)
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        graphData.nodes as Node[],
        graphData.edges.map(e => ({
          ...e,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
        })) as Edge[]
      )

      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
    } catch (error) {
      console.error('Failed to load graph:', error)
      toast({ title: 'Error', description: 'Failed to load knowledge map.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [selectedSubjectId, setNodes, setEdges])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onNodeClick = (_: React.MouseEvent | React.TouchEvent, node: Node) => {
    setSelectedNode(node)
  }

  return (
    <div className="animate-fade-in">
      <div className={`flex h-[calc(100vh-180px)] flex-col gap-6 ${pageShellFrameClass}`}>
      <PageHeroShell
        className="px-4 py-3 sm:px-5 sm:py-3.5"
        eyebrow={
          <div className={pageBadgeClass}>
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Knowledge Graph
          </div>
        }
        title={
          <div className="flex items-center gap-3">
            <span>知识图谱</span>
            <Badge className="border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-500">v2.0</Badge>
          </div>
        }
        subtitle="按知识依赖关系查看掌握进度、节点连接与下一步建议。"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-white/10 bg-white/[0.04] text-blue-50 hover:bg-white/[0.08] hover:text-white"
          >
            <Layers className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Filters */}
        <div className="w-64 flex flex-col gap-4">
          <Card className={cn(pagePanelClass, 'p-4')}>
            <SectionBlockHeader
              title={
                <span className={cn(pageCardTitleClass, 'flex items-center gap-2 text-text-primary dark:text-white')}>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Subjects
                </span>
              }
              description="切换科目后重新计算当前知识网络与推荐路径。"
              className="mb-4 gap-2"
            />
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={cn(
                    'w-full rounded-full px-3 py-2 text-left text-xs font-semibold transition-colors',
                    selectedSubjectId === s.id
                      ? pagePillActiveClass
                      : pagePillInactiveClass
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Card>

          <Card className={cn(pagePanelClass, 'relative overflow-hidden p-4')}>
             <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                   <Target className="w-4 h-4 text-yellow-500" />
                   <span className={pageKickerClass}>Mission</span>
                </div>
                <p className={pageMetaTextClass}>
                   Complete prerequisite nodes to unlock advanced concepts. 
                </p>
             </div>
             <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          </Card>
        </div>

        {/* Center: Graph Canvas */}
        <Card className={cn(pagePanelClass, 'relative flex-1 overflow-hidden p-0 shadow-2xl dark:bg-slate-950')}>
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md z-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-200 font-medium text-sm animate-pulse">Calculating optimal path...</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              colorMode="dark"
              minZoom={0.2}
              maxZoom={1.5}
            >
              <Background color="#1e293b" gap={20} size={1} />
              <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-400" />
              <MiniMap 
                className="!bg-slate-900 !border-slate-800 !rounded-xl" 
                nodeColor={(n) => {
                  if (n.data.status === 'mastered') return '#22c55e'
                  if (n.data.status === 'started') return '#3b82f6'
                  return '#334155'
                }}
                maskColor="rgba(0, 0, 0, 0.3)"
              />
            </ReactFlow>
          )}
        </Card>

        {/* Right: Info Sidebar */}
        <div className="w-80 flex flex-col gap-6 animate-in fade-in duration-500">
          {selectedNode ? (
            <Card className={cn(pagePanelClass, 'border-blue-500/20 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_30%),linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] p-6 shadow-xl dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_30%),linear-gradient(180deg,rgba(10,18,32,0.96),rgba(5,11,20,0.98))]')}>
              <Badge className="mb-3 border-blue-500/20 bg-blue-500/10 text-blue-500 uppercase text-[10px] tracking-widest">{selectedNode.data.subject as string}</Badge>
              <h3 className={cn(pageSectionTitleClass, 'mb-2 leading-tight text-text-primary dark:text-white')}>{selectedNode.data.label as string}</h3>
              <p className={pageSectionDescriptionClass}>
                Inspect mastery, dependent modules, and exercise volume before launching the next chapter.
              </p>
              
              <div className="mt-8 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mastery Progress</span>
                    <span className="text-[18px] font-semibold tracking-tight text-blue-500">{selectedNode.data.mastery as number}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${selectedNode.data.status === 'mastered' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}
                      style={{ width: `${selectedNode.data.mastery}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={cn(pageSoftInsetClass, 'p-4 text-center')}>
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Modules</div>
                    <div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-white">{(selectedNode.data.stats as { lessons?: number }).lessons || 0}</div>
                  </div>
                  <div className={cn(pageSoftInsetClass, 'p-4 text-center')}>
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Exercises</div>
                    <div className="text-[18px] font-semibold tracking-tight text-slate-900 dark:text-white">{(selectedNode.data.stats as { questions?: number }).questions || 0}</div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                   <Button fullWidth className="rounded-2xl bg-blue-600 py-6 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500">
                     Launch Chapter <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                   <Button fullWidth variant="ghost" className="py-2 text-xs text-slate-500 hover:bg-transparent hover:text-slate-400">
                     Explore Prerequisites
                   </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className={cn(pageEmptyStateClass, 'flex flex-1 flex-col items-center justify-center p-8 text-center')}>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-slate-400 opacity-20" />
              </div>
              <h4 className="mb-1 text-[15px] font-semibold text-slate-500 dark:text-slate-300">Intelligence Layer</h4>
              <p className="text-[12px] leading-5 text-slate-500 dark:text-slate-400">Select any knowledge node to inspect detailed analytics and resources</p>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
