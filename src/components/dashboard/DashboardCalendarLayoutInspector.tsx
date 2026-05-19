'use client'

import type { DashboardCalendarLayoutPreset } from './calendarLayoutPreset'
import {
  InspectorPanel,
  RangeField,
  SectionBlock,
} from './DashboardPresetInspectorFields'

export function DashboardCalendarLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardCalendarLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardCalendarLayoutPreset) => void
  onSave: () => void
}) {
  return (
    <InspectorPanel
      visible={visible}
      selected={selected}
      saving={saving}
      presetLabel="Calendar Preset"
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
          min={180}
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
          min={-80}
          max={120}
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

      <SectionBlock title="Content">
        <RangeField
          label="X"
          value={preset.contentTransform.x}
          min={-120}
          max={120}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              contentTransform: { ...preset.contentTransform, x: next },
            })
          }
        />
        <RangeField
          label="Y"
          value={preset.contentTransform.y}
          min={-80}
          max={120}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              contentTransform: { ...preset.contentTransform, y: next },
            })
          }
        />
        <RangeField
          label="缩放"
          value={preset.contentTransform.scale}
          min={0.7}
          max={1.45}
          step={0.01}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              contentTransform: { ...preset.contentTransform, scale: next },
            })
          }
        />
      </SectionBlock>
    </InspectorPanel>
  )
}
