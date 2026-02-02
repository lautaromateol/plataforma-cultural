import { Suspense } from "react"
import { UserDetailsContent } from "./components/user-details-content"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface UserDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <UserDetailsContent userId={id} />
    </Suspense>
  )
}
