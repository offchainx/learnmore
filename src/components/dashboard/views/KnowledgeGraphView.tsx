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
import { getKnowledgeGraphData } from '@/actions/knowledge'
import { getCategories } from '@/actions/community'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen, Target, ChevronRight,
  Layers, Zap, Loader2
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

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
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            Knowledge Navigator
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 text-[10px]">v2.0</Badge>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Strategic learning paths powered by academic dependencies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Layers className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Filters */}
        <div className="w-64 flex flex-col gap-4">
          <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> Subjects
            </h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedSubjectId === s.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-slate-900 border-transparent text-white overflow-hidden relative">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Target className="w-4 h-4 text-yellow-500" />
                   <span className="text-xs font-bold uppercase tracking-wider">Mission</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                   Complete prerequisite nodes to unlock advanced concepts. 
                </p>
             </div>
             <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          </Card>
        </div>

        {/* Center: Graph Canvas */}
        <Card className="flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl">
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
            <Card className="p-6 border-blue-500/30 bg-gradient-to-br from-indigo-500/5 to-transparent shadow-xl">
              <Badge className="mb-3 bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px] tracking-widest">{selectedNode.data.subject as string}</Badge>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white leading-tight">{selectedNode.data.label as string}</h3>
              
              <div className="space-y-6 mt-8">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Mastery Progress</span>
                    <span className="font-bold text-blue-500">{selectedNode.data.mastery as number}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${selectedNode.data.status === 'mastered' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}
                      style={{ width: `${selectedNode.data.mastery}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Modules</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{(selectedNode.data.stats as { lessons?: number }).lessons || 0}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Exercises</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{(selectedNode.data.stats as { questions?: number }).questions || 0}</div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                   <Button fullWidth className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 py-6 rounded-2xl font-bold">
                     Launch Chapter <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                   <Button fullWidth variant="ghost" className="text-slate-500 text-xs py-2 hover:bg-transparent hover:text-slate-400">
                     Explore Prerequisites
                   </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex-1 border-dashed border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-slate-400 opacity-20" />
              </div>
              <h4 className="text-slate-400 font-bold mb-1">Intelligence Layer</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Select any knowledge node to inspect detailed analytics and resources</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

