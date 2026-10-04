import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cgu')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cgu"!</div>
}
