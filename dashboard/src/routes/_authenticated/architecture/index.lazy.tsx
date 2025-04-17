import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/architecture/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base/architecture',
      replace: true
    })
  },
  component: () => null,
})
