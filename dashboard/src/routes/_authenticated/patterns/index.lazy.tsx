import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/patterns/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base/patterns',
      replace: true
    })
  },
  component: () => null,
})
