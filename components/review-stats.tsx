import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ReviewStats } from '@/lib/types'
import { CheckCircle, XCircle, Clock, Package, TrendingUp, Target } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ReviewStatsProps {
  stats: ReviewStats
}

export function ReviewStatsComponent({ stats }: ReviewStatsProps) {
  const approvalRate = stats.total_groups > 0 
    ? ((stats.approved / stats.total_groups) * 100).toFixed(1)
    : '0'
    
  const reviewProgress = stats.total_groups > 0
    ? ((stats.approved + stats.rejected) / stats.total_groups) * 100
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Review Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(reviewProgress)}% of groups reviewed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {stats.approved + stats.rejected} / {stats.total_groups}
              </p>
              <p className="text-sm text-muted-foreground">groups reviewed</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={reviewProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{stats.approved} approved</span>
            <span>{stats.pending_review} pending</span>
            <span>{stats.rejected} rejected</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_groups}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {stats.grouping_rate.toFixed(1)}% grouping rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_review}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting SME review
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              With feedback for improvement
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}