import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/best-practices/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base/best-practices',
      replace: true
    })
  },
  component: () => null,
})
