import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/technical-specs/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base/technical-specs',
      replace: true
    })
  },
  component: () => null,
})
