import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AchievementsView } from '../AchievementsView'

describe('AchievementsView', () => {
  it('在缺少概览数据时显示中性占位，不伪造 0 值或旧 CTA', () => {
    render(
      <AchievementsView
        user={{ username: null, avatar: null }}
        overview={null}
        badges={[]}
      />
    )

    expect(screen.getByText('你的账号')).toBeInTheDocument()
    expect(screen.getByText('U')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(4)
    expect(screen.queryByText('Achievement MVP')).not.toBeInTheDocument()
    expect(screen.queryByText('Student')).not.toBeInTheDocument()
  })
})
