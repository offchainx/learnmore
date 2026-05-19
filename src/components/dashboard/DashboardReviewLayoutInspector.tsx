'use client'

import type {
  DashboardReviewLayoutPreset,
  ReviewCardBox,
  ReviewCardKey,
} from './reviewLayoutPreset'
import {
  InspectorPanel,
  RangeField,
  SectionBlock,
} from './DashboardPresetInspectorFields'

const cardLabels: Record<ReviewCardKey, string> = {
  math: '数学卡',
  science: '科学卡',
  english: '英语卡',
  social: '社会卡',
}

function CardBoxEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: ReviewCardBox
  onChange: (value: ReviewCardBox) => void
}) {
  return (
    <SectionBlock title={label}>
      <RangeField
        label="X"
        value={value.x}
        min={-40}
        max={720}
        onChange={(next) => onChange({ ...value, x: next })}
      />
      <RangeField
        label="Y"
        value={value.y}
        min={-20}
        max={220}
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
        min={90}
        max={220}
        onChange={(next) => onChange({ ...value, height: next })}
      />
    </SectionBlock>
  )
}

export function DashboardReviewLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardReviewLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardReviewLayoutPreset) => void
  onSave: () => void
}) {
  const patchCard = (key: ReviewCardKey, value: ReviewCardBox) => {
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
      presetLabel="Review Preset"
      onSave={onSave}
    >
      <SectionBlock title="Card">
        <RangeField
          label="宽度"
          value={preset.shell.width}
          min={420}
          max={980}
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
          min={170}
          max={360}
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

      {(['math', 'science', 'english', 'social'] as const).map((key) => (
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
