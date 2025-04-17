import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/overview/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base',
      replace: true
    })
  },
  component: () => null,
})
