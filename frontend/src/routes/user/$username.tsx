import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$username')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/$username"!</div>
}
