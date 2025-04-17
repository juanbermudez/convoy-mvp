import { createLazyFileRoute, redirect } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/source-code/')({
  beforeLoad: () => {
    throw redirect({
      to: '/knowledge-base/source-code',
      replace: true
    })
  },
  component: () => null,
})
