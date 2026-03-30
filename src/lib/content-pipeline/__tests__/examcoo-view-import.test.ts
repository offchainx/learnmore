import { describe, expect, it } from 'vitest'
import { deriveExamcooQuestionGroups } from '../examcoo-view-import'

describe('deriveExamcooQuestionGroups', () => {
  it('应该从 Examcoo block 中识别出阅读材料与子题', () => {
    const payload = [
      {
        id: '1287996',
        a: '七年级语文阅读理解',
      },
      {
        id: 'b',
        c: [
          { c: '<p>（二）（15分）</p>', p: '1' },
          { c: '<p>三轮车夫</p>', p: '1' },
          {
            c: '<p>①深夜，小城伤佛睡着了，只有马路两旁的街灯，还在默默坚守着自己的岗位，给寒冷的冬夜带来些许温馨。</p>',
            p: '1',
          },
          {
            c: '<p>②她抱着正发高烧的女儿，穿过漆黑的小巷，奔向附近在永得堂便民药店值班的医生处，发出急促而清脆的响声。</p>',
            p: '1',
          },
          {
            c: '<p>③突然，她看见前面街口处停着一辆三轮车，旁边还晃动着两个人影。她忙跑了过去。</p>',
            p: '1',
          },
        ],
      },
      {
        id: 's5_558758630795644943',
        a: '<p>第①段中画线句表面上写街灯带来温馨，从全文看，还有什么其他含意？</p>',
      },
      {
        id: 's5_558758630795644952',
        a: '<p>概括文意内容简要概括父亲的形象。</p>',
      },
      {
        id: 's1_10001',
        a: '<p>下一部分普通选择题</p>',
      },
    ] as Parameters<typeof deriveExamcooQuestionGroups>[0]

    const groups = deriveExamcooQuestionGroups(payload, [
      's5_558758630795644943',
      's5_558758630795644952',
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0]).toMatchObject({
      groupId: 'examcoo-block-2',
      title: '三轮车夫',
      questionIds: ['s5_558758630795644943', 's5_558758630795644952', 's1_10001'],
      selectedQuestionIds: ['s5_558758630795644943', 's5_558758630795644952'],
    })
    expect(groups[0]?.material).toContain('深夜，小城伤佛睡着了')
    expect(groups[0]?.material).toContain('她看见前面街口处停着一辆三轮车')
  })

  it('不应该把过短的普通 block 误识别为组合题材料', () => {
    const payload = [
      {
        id: 'b',
        c: [
          { c: '<p>一、单选题</p>', p: '1' },
          { c: '<p>共 5 题</p>', p: '1' },
        ],
      },
      {
        id: 's1_1',
        a: '<p>下列说法正确的是？</p>',
      },
    ] as Parameters<typeof deriveExamcooQuestionGroups>[0]

    const groups = deriveExamcooQuestionGroups(payload, ['s1_1'])

    expect(groups).toHaveLength(0)
  })
})
