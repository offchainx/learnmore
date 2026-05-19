'use client'

import type {
  DashboardTimeLayoutPreset,
  TimeStudyPanelBox,
  TimeStudyPanelKey,
} from './timeLayoutPreset'
import {
  InspectorPanel,
  RangeField,
  SectionBlock,
} from './DashboardPresetInspectorFields'

const panelLabels: Record<TimeStudyPanelKey, string> = {
  pie: '饼图区',
  stats: '明细区',
}

function PanelBoxEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: TimeStudyPanelBox
  onChange: (value: TimeStudyPanelBox) => void
}) {
  return (
    <SectionBlock title={label}>
      <RangeField
        label="X"
        value={value.x}
        min={-40}
        max={260}
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
        min={112}
        max={320}
        onChange={(next) => onChange({ ...value, width: next })}
      />
      <RangeField
        label="高度"
        value={value.height}
        min={112}
        max={240}
        onChange={(next) => onChange({ ...value, height: next })}
      />
    </SectionBlock>
  )
}

export function DashboardTimeLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardTimeLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardTimeLayoutPreset) => void
  onSave: () => void
}) {
  const patchPanel = (key: TimeStudyPanelKey, value: TimeStudyPanelBox) => {
    onPresetChange({
      ...preset,
      panelBoxes: {
        ...preset.panelBoxes,
        [key]: value,
      },
    })
  }

  return (
    <InspectorPanel
      visible={visible}
      selected={selected}
      saving={saving}
      presetLabel="Time Preset"
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

      {(['pie', 'stats'] as const).map((key) => (
        <PanelBoxEditor
          key={key}
          label={panelLabels[key]}
          value={preset.panelBoxes[key]}
          onChange={(value) => patchPanel(key, value)}
        />
      ))}
    </InspectorPanel>
  )
}
