import { Suspense } from "react"
import { AdminContent } from "./components/admin-content"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      }
    >
      <AdminContent />
    </Suspense>
  )
}
