import { IconRocket } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Breadcrumb } from '@/components/breadcrumb'
import { SyncStatus } from '@/components/sync/SyncStatus'
import { Main } from '@/components/layout/main'

interface PlaceholderProps {
  title: string
  description?: string
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div id="content" className="border rounded-lg overflow-hidden">
      <Header fixed>
        <div className="flex flex-1 w-full items-center justify-between">
          <Breadcrumb 
            items={[
              { label: 'Home' },
              { label: title }
            ]} 
          />
          <SyncStatus />
        </div>
      </Header>
      
      <Main>
        <div className="container mx-auto py-8">
          <Card className="border-2 border-dashed border-border">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <IconRocket className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>
                {description || "This feature is coming soon. Stay tuned!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>We're currently working on this feature and will release it soon.</p>
            </CardContent>
          </Card>
        </div>
      </Main>
    </div>
  )
}
