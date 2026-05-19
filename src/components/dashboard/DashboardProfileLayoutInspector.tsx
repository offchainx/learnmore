'use client'

import type {
  DashboardProfileLayoutPreset,
  ProfileSectionBox,
  ProfileSectionKey,
} from './profileLayoutPreset'
import {
  InspectorPanel,
  RangeField,
  SectionBlock,
} from './DashboardPresetInspectorFields'

const sectionLabels: Record<ProfileSectionKey, string> = {
  avatar: '头像区',
  greeting: '问候区',
  stats: '数据区',
  badge: '徽章区',
}

function SectionBoxEditor({
  label,
  value,
  onChange,
}: {
  label: string
  value: ProfileSectionBox
  onChange: (value: ProfileSectionBox) => void
}) {
  return (
    <SectionBlock title={label}>
      <RangeField
        label="X"
        value={value.x}
        min={0}
        max={760}
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
        min={44}
        max={320}
        onChange={(next) => onChange({ ...value, width: next })}
      />
      <RangeField
        label="高度"
        value={value.height}
        min={44}
        max={220}
        onChange={(next) => onChange({ ...value, height: next })}
      />
    </SectionBlock>
  )
}

export function DashboardProfileLayoutInspector({
  visible,
  selected,
  preset,
  saving,
  onPresetChange,
  onSave,
}: {
  visible: boolean
  selected: boolean
  preset: DashboardProfileLayoutPreset
  saving: boolean
  onPresetChange: (preset: DashboardProfileLayoutPreset) => void
  onSave: () => void
}) {
  const patchSection = (key: ProfileSectionKey, value: ProfileSectionBox) => {
    onPresetChange({
      ...preset,
      sectionBoxes: {
        ...preset.sectionBoxes,
        [key]: value,
      },
    })
  }

  return (
    <InspectorPanel
      visible={visible}
      selected={selected}
      saving={saving}
      presetLabel="Profile Preset"
      onSave={onSave}
    >
      <SectionBlock title="Card">
        <RangeField
          label="宽度"
          value={preset.shell.width}
          min={360}
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
          min={130}
          max={320}
          onChange={(next) =>
            onPresetChange({
              ...preset,
              shell: { ...preset.shell, height: next },
            })
          }
        />
      </SectionBlock>

      {(['avatar', 'greeting', 'stats', 'badge'] as const).map((key) => (
        <SectionBoxEditor
          key={key}
          label={sectionLabels[key]}
          value={preset.sectionBoxes[key]}
          onChange={(value) => patchSection(key, value)}
        />
      ))}
    </InspectorPanel>
  )
}
