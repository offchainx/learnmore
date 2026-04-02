import { after } from 'next/server'

type AfterTask = () => Promise<void> | void

export function runAfterTask(task: AfterTask, label = 'background-task') {
  after(async () => {
    try {
      await task()
    } catch (error) {
      console.error(`[AfterTask:${label}] Failed:`, error)
    }
  })
}
