import { createLazyFileRoute } from '@tanstack/react-router'
import KnowledgeBase from '@/features/knowledge-base'

export const Route = createLazyFileRoute('/_authenticated/knowledge-base/')({
  component: KnowledgeBase,
})
