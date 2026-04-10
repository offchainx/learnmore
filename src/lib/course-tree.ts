import type { CourseTreeData } from '@/actions/courses/subject'

export function findCourseNodeById(
  nodes: CourseTreeData[],
  targetId: string,
): CourseTreeData | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }

    if (node.children && node.children.length > 0) {
      const matched = findCourseNodeById(node.children, targetId)
      if (matched) {
        return matched
      }
    }
  }

  return null
}

export function findFirstCourseLeaf(
  nodes: CourseTreeData[],
): CourseTreeData | null {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      return node
    }

    const nested = findFirstCourseLeaf(node.children)
    if (nested) {
      return nested
    }
  }

  return null
}

export function countCourseNodes(nodes: CourseTreeData[]): number {
  return nodes.reduce((total, node) => {
    return total + 1 + (node.children ? countCourseNodes(node.children) : 0)
  }, 0)
}

export function countCourseLeaves(nodes: CourseTreeData[]): number {
  return nodes.reduce((total, node) => {
    if (!node.children || node.children.length === 0) {
      return total + 1
    }
    return total + countCourseLeaves(node.children)
  }, 0)
}

