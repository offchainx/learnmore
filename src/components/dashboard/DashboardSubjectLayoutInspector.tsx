'use client'

import type {
  DashboardSubjectLayoutPreset,
  SubjectCardBox,
  SubjectCardKey,
} from './subjectLayoutPreset'
import {
  InspectorPanel,
  RangeField,
  SectionBlock,
} from './DashboardPresetInspectorFields'

const cardLabels: Record<SubjectCardKey, string> = {
  math: '数学卡',
  science: '科学卡',
  chinese: '中文卡',
  geography: '地理卡',
}

function CardBoxEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: SubjectCardBox
  onChange: (value: SubjectCardBox) => void
}) {
  return (
    <SectionBlock title={label}>
      <RangeField
        label="X"
        value={value.x}
        min={-20}
        max={320}
        onChange={(next) => onChange({ ...value, x: next })}
      />
      <RangeField
        label="Y"
        value={value.y}
        min={-20}
        max={260}
        onChange={(next) => onChange({ ...value, y: next })}
      />
      <RangeField
        label="宽度"
        value={value.width}
        min={110}
        max={260}
        onChange={(next) => onChange({ ...value, width: next })}
      />
      <RangeField
        label="高度"
        value={value.height}
        min={70}
        max={180}
        onChange={(next) => onChange({ ...value, height: next })}
      />
    </SectionBlock>
  )
}

export function DashboardSubjectLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardSubjectLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardSubjectLayoutPreset) => void
  onSave: () => void
}) {
  const patchCard = (key: SubjectCardKey, value: SubjectCardBox) => {
    onPresetChange({
      ...preset,
      cardBoxes: {
        ...preset.cardBoxes,
        [key]: value,
      },
    })
  }

  return (
    <InspectorPanel
      visible={visible}
      selected={selected}
      saving={saving}
      presetLabel="Subject Preset"
      onSave={onSave}
    >
      <SectionBlock title="Card">
        <RangeField
          label="宽度"
          value={preset.shell.width}
          min={260}
          max={640}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              shell: { ...preset.shell, width: next },
            })
          }
        />
        <RangeField
          label="高度"
          value={preset.shell.height}
          min={220}
          max={520}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              shell: { ...preset.shell, height: next },
            })
          }
        />
      </SectionBlock>

      <SectionBlock title="Title">
        <RangeField
          label="X"
          value={preset.titleTransform.x}
          min={-120}
          max={120}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              titleTransform: { ...preset.titleTransform, x: next },
            })
          }
        />
        <RangeField
          label="Y"
          value={preset.titleTransform.y}
          min={-40}
          max={60}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              titleTransform: { ...preset.titleTransform, y: next },
            })
          }
        />
        <RangeField
          label="缩放"
          value={preset.titleTransform.scale}
          min={0.7}
          max={1.45}
          step={0.01}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              titleTransform: { ...preset.titleTransform, scale: next },
            })
          }
        />
      </SectionBlock>

      {(['math', 'science', 'chinese', 'geography'] as const).map((key) => (
        <CardBoxEditor
          key={key}
          label={cardLabels[key]}
          value={preset.cardBoxes[key]}
          onChange={(value) => patchCard(key, value)}
        />
      ))}
    </InspectorPanel>
  )
}
