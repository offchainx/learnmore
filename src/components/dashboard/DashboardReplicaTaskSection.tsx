'use client'

import Image from 'next/image'
import React from 'react'
import { Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import subjectMathIcon from '../../../.codex/artifacts/dashboard-icons/subject-math-icon.png'
import subjectScienceIcon from '../../../.codex/artifacts/dashboard-icons/subject-science-icon.png'
import subjectChineseIcon from '../../../.codex/artifacts/dashboard-icons/subject-chinese-icon.png'
import subjectGeographyIcon from '../../../.codex/artifacts/dashboard-icons/subject-geography-icon.png'
import {
  defaultDashboardTaskLayoutPreset,
  type DashboardTaskLayoutPreset,
  type TaskCardBox,
  type TaskCardBoxes,
  type TaskCardKey,
  type TaskTitleTransform,
} from './taskLayoutPreset'

const taskCards = [
  {
    icon: 'math',
    title: '数学：',
    subtitle: '代数基础',
    progress: '2/3',
    width: '54%',
  },
  {
    icon: 'science',
    title: '科学：',
    subtitle: '物质及其变化',
    progress: '1/2',
    width: '44%',
  },
  {
    icon: 'english',
    title: '英语：',
    subtitle: '比喻语言',
    progress: '0/2',
    width: '36%',
  },
  {
    icon: 'bonus',
    title: '加分任务：',
    subtitle: '每日挑战',
    progress: '',
    width: '0%',
  },
] as const

export const defaultTaskTitleTransform: TaskTitleTransform =
  defaultDashboardTaskLayoutPreset.titleTransform

export const defaultTaskCardBoxes: TaskCardBoxes =
  defaultDashboardTaskLayoutPreset.taskCardBoxes

const TASK_SHELL_WIDTH = 1070.137
const TASK_SHELL_HEIGHT = 186.667

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getAverageScale(
  box: { width: number; height: number },
  base: { width: number; height: number }
) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height

  return clamp((scaleX + scaleY) / 2, 0.72, 1.75)
}

function CardViewport({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative h-full w-full min-h-full min-w-0 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-[#f07d2c]">{icon}</div>
        <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

function EditableTitleFrame({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultTaskTitleTransform,
  selected = false,
  ariaLabel,
  onMoveStart,
  onScaleStart,
  controlSide = 'right',
  children,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: TaskTitleTransform
  selected?: boolean
  ariaLabel: string
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onScaleStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  controlSide?: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative z-[90] inline-flex w-fit origin-top-left flex-col ${
        controlSide === 'left' ? 'items-start' : 'items-end'
      }`}
      style={{
        transform: `translate(${titleTransform.x}px, ${titleTransform.y}px) scale(${titleTransform.scale})`,
      }}
    >
      {children}
      {editMode ? (
        <div
          className={`mt-1 flex h-7 items-center gap-1 ${
            showEditControls ? 'visible' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!showEditControls}
        >
          <div className="pointer-events-none rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
            标题
          </div>
          <button
            type="button"
            aria-label={ariaLabel}
            className={`rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none ${
              selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
            }`}
            onPointerDown={onMoveStart}
          >
            拖动
          </button>
          <button
            type="button"
            aria-label={`${ariaLabel} 缩放`}
            className="rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none"
            onPointerDown={onScaleStart}
          >
            缩放
          </button>
        </div>
      ) : null}
    </div>
  )
}

function EditableSubjectCardFrame({
  editMode = false,
  showEditControls = true,
  box,
  selected = false,
  ariaLabel,
  onMoveStart,
  onResizeStart,
  badgeText = '拖动',
  children,
}: {
  editMode?: boolean
  showEditControls?: boolean
  box: TaskCardBox
  selected?: boolean
  ariaLabel: string
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  badgeText?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }}
    >
      <div className="relative h-full w-full">
        {children}
        {editMode && showEditControls ? (
          <div className="pointer-events-none absolute left-2 top-2 z-[75] rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
            {badgeText}
          </div>
        ) : null}
        {editMode && showEditControls ? (
          <button
            type="button"
            aria-label={ariaLabel}
            className={`absolute inset-0 z-[76] cursor-move rounded-[20px] outline-none ${
              selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
            }`}
            onPointerDown={onMoveStart}
          >
            <span className="sr-only">移动卡片</span>
          </button>
        ) : null}
        {editMode && showEditControls ? (
          <button
            type="button"
            aria-label={`${ariaLabel} 调整大小`}
            className="absolute bottom-[-2px] right-[-2px] z-[77] h-5 w-5 cursor-nwse-resize rounded-[5px] border border-white/80 bg-[#ff7d19] shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
            onPointerDown={onResizeStart}
          />
        ) : null}
      </div>
    </div>
  )
}

function SubjectProgressIcon({ kind, size = 48 }: { kind: string; size?: number }) {
  const className = 'rounded-[14px]'

  if (kind === 'math') {
    return <Image src={subjectMathIcon} alt="数学图标" width={size} height={size} className={className} />
  }

  if (kind === 'science') {
    return <Image src={subjectScienceIcon} alt="科学图标" width={size} height={size} className={className} />
  }

  if (kind === 'chinese') {
    return <Image src={subjectChineseIcon} alt="中文图标" width={size} height={size} className={className} />
  }

  return <Image src={subjectGeographyIcon} alt="地理图标" width={size} height={size} className={className} />
}

function getTaskSubjectIconKind(kind: string) {
  if (kind === 'math') return 'math'
  if (kind === 'science') return 'science'
  if (kind === 'english') return 'chinese'
  return 'geography'
}

function ProgressTrack({ value, color }: { value: string; color: string }) {
  return (
    <div className="h-[7px] overflow-hidden rounded-full bg-[#efdfcf]">
      <div className="h-full rounded-full" style={{ width: value, backgroundColor: color }} />
    </div>
  )
}

function TaskCardContent({ task }: { task: (typeof taskCards)[number] }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          <SubjectProgressIcon kind={getTaskSubjectIconKind(task.icon)} size={54} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-[1.1] text-[#25303c]">
                {task.title}
              </div>
              <div className="mt-1 text-[12px] leading-tight text-[#455160]">
                {task.subtitle}
              </div>
            </div>
            {task.progress ? (
              <div className="pt-[1px] text-[13px] font-medium text-[#374250]">
                {task.progress}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <ProgressTrack
          value={task.width}
          color={
            task.icon === 'science'
              ? '#23b48a'
              : task.icon === 'english'
                ? '#efdccc'
                : '#1e73e9'
          }
        />
      </div>
    </div>
  )
}

export function DashboardReplicaTaskCard({
  preset = defaultDashboardTaskLayoutPreset,
}: {
  preset?: DashboardTaskLayoutPreset
}) {
  return (
    <Card
      className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${TASK_SHELL_WIDTH}px)`,
        height: `${TASK_SHELL_HEIGHT}px`,
      }}
    >
      <TaskCardBody
        titleTransform={preset.titleTransform}
        taskCardBoxes={preset.taskCardBoxes}
      />
    </Card>
  )
}

export function TaskCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultTaskTitleTransform,
  taskCardBoxes = defaultTaskCardBoxes,
  onStartTitleMove,
  onStartTitleScale,
  onStartCardMove,
  onStartCardResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: TaskTitleTransform
  taskCardBoxes?: TaskCardBoxes
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardMove?: (key: TaskCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardResize?: (key: TaskCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <CardViewport>
      <div
        className="relative z-[120] h-full min-h-0"
        style={{ minHeight: `${TASK_SHELL_HEIGHT}px` }}
      >
        <div className="absolute left-0 top-0 z-[130]">
          <EditableTitleFrame
            editMode={editMode}
            showEditControls={showEditControls}
            titleTransform={titleTransform}
            ariaLabel="移动今日任务标题"
            onMoveStart={onStartTitleMove}
            onScaleStart={onStartTitleScale}
          >
            <SectionTitle icon={<Target className="h-5 w-5" />} title="今日任务" />
          </EditableTitleFrame>
        </div>

        <div className="absolute inset-0 min-h-0">
          {taskCards.map((task) => {
            const key = task.icon as TaskCardKey
            const box = taskCardBoxes[key]
            const taskScale = getAverageScale(box, defaultTaskCardBoxes[key])

            return (
              <EditableSubjectCardFrame
                key={task.title}
                editMode={editMode}
                showEditControls={showEditControls}
                box={box}
                ariaLabel={`移动 ${task.title} 卡片`}
                badgeText={`拖动 ${task.title.replace('：', '')}`}
                onMoveStart={(event) => onStartCardMove?.(key, event)}
                onResizeStart={(event) => onStartCardResize?.(key, event)}
              >
                <div
                  className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-3"
                  style={{
                    transform: `scale(${taskScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <TaskCardContent task={task} />
                </div>
              </EditableSubjectCardFrame>
            )
          })}
        </div>
      </div>
    </CardViewport>
  )
}
