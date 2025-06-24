"use client"

import { useState, useEffect, useCallback } from 'react'
import { VariantGroupCard } from '@/components/variant-group-card'
import { ReviewStatsComponent } from '@/components/review-stats'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VariantGroup, ReviewStats } from '@/lib/types'
import { importJSON } from '@/lib/import-handlers'
import { Download, Upload, Filter, Search, Keyboard, Info, LogOut, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSession, signOut } from 'next-auth/react'

export default function ReviewPage() {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<VariantGroup[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [stats, setStats] = useState<ReviewStats>({
    total_groups: 0,
    pending_review: 0,
    approved: 0,
    rejected: 0,
    total_products: 854,
    grouped_products: 0,
    grouping_rate: 0
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('variant-groups')
    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups)
      setGroups(parsedGroups)
      updateStats(parsedGroups)
    }
  }, [])

  const updateStats = (groupList: VariantGroup[]) => {
    const grouped_products = groupList.reduce((sum, g) => sum + g.variant_count, 0)
    const newStats: ReviewStats = {
      total_groups: groupList.length,
      pending_review: groupList.filter(g => g.review_status === 'pending').length,
      approved: groupList.filter(g => g.review_status === 'approved').length,
      rejected: groupList.filter(g => g.review_status === 'rejected').length,
      total_products: 854,
      grouped_products,
      grouping_rate: (grouped_products / 854) * 100
    }
    setStats(newStats)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          // Use the new import handler
          const importResult = importJSON(data)
          const transformedGroups = importResult.groups
          
          setGroups(transformedGroups)
          updateStats(transformedGroups)
          
          // Update metadata if available
          if (importResult.metadata) {
            setStats(prev => ({
              ...prev,
              total_products: importResult.metadata.total_products || prev.total_products,
              grouping_rate: importResult.metadata.grouping_rate || prev.grouping_rate,
              grouped_products: importResult.metadata.grouped_products || 
                transformedGroups.reduce((sum, g) => sum + g.variants.length, 0)
            }))
          }
          
          // Save to localStorage
          localStorage.setItem('variant-groups', JSON.stringify(transformedGroups))
          
          // Show success message with format info
          const formatInfo = importResult.format === 'notebook' 
            ? 'Notebook JSON format detected and imported successfully!'
            : 'LangChain JSON format detected and imported successfully!'
          alert(formatInfo)
        } catch (error) {
          console.error('Import error:', error)
          alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleApprove = (groupId: string) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId 
        ? { ...g, review_status: 'approved' as const, review_date: new Date().toISOString() }
        : g
    )
    setGroups(updatedGroups)
    updateStats(updatedGroups)
    localStorage.setItem('variant-groups', JSON.stringify(updatedGroups))
  }

  const handleReject = (groupId: string, reason: string, feedback: string) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            review_status: 'rejected' as const, 
            rejection_reason: reason,
            feedback,
            review_date: new Date().toISOString()
          }
        : g
    )
    setGroups(updatedGroups)
    updateStats(updatedGroups)
    localStorage.setItem('variant-groups', JSON.stringify(updatedGroups))
  }

  const exportResults = () => {
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        total_groups: stats.total_groups,
        approved: stats.approved,
        rejected: stats.rejected,
        pending: stats.pending_review
      },
      approved_groups: groups.filter(g => g.review_status === 'approved'),
      rejected_groups: groups.filter(g => g.review_status === 'rejected').map(g => ({
        ...g,
        rejection_details: {
          reason: g.rejection_reason,
          feedback: g.feedback,
          review_date: g.review_date
        }
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sku-review-results-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const pendingGroups = groups.filter(g => g.review_status === 'pending')
      if (pendingGroups.length === 0) return
      
      switch (e.key.toLowerCase()) {
        case 'a':
          if (currentIndex < pendingGroups.length) {
            handleApprove(pendingGroups[currentIndex].id)
          }
          break
        case 'r':
          // Would need to implement reject with modal
          break
        case 'arrowdown':
        case 'j':
          setCurrentIndex(prev => Math.min(prev + 1, pendingGroups.length - 1))
          break
        case 'arrowup':
        case 'k':
          setCurrentIndex(prev => Math.max(prev - 1, 0))
          break
        case '?':
          setShowKeyboardHelp(prev => !prev)
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [groups, currentIndex, handleApprove])

  const filteredGroups = groups.filter(g => {
    const matchesFilter = filter === 'all' || g.review_status === filter
    const matchesSearch = searchQuery === '' || 
      g.parent_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.parent_sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.variants.some(v => 
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesFilter && matchesSearch
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SKU Variant Review Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Review AI-generated product variant groups and provide feedback for improvements
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {session?.user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {session.user.email}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                className="flex items-center gap-2"
              >
                <Keyboard className="h-4 w-4" />
                Shortcuts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showKeyboardHelp && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><kbd className="px-2 py-1 bg-background rounded border">A</kbd> Approve current group</div>
            <div><kbd className="px-2 py-1 bg-background rounded border">R</kbd> Reject current group</div>
            <div><kbd className="px-2 py-1 bg-background rounded border">↓</kbd> or <kbd className="px-2 py-1 bg-background rounded border">J</kbd> Next group</div>
            <div><kbd className="px-2 py-1 bg-background rounded border">↑</kbd> or <kbd className="px-2 py-1 bg-background rounded border">K</kbd> Previous group</div>
            <div><kbd className="px-2 py-1 bg-background rounded border">?</kbd> Toggle this help</div>
          </div>
        </div>
      )}

      <ReviewStatsComponent stats={stats} />

      <div className="mb-6 space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by SKU, title, or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="transition-all"
            >
              All
              <Badge variant="secondary" className="ml-2">{stats.total_groups}</Badge>
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
              className="transition-all"
            >
              Pending
              <Badge variant="secondary" className="ml-2">{stats.pending_review}</Badge>
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
              className="transition-all"
            >
              Approved
              <Badge variant="secondary" className="ml-2">{stats.approved}</Badge>
            </Button>
            <Button
              variant={filter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('rejected')}
              className="transition-all"
            >
              Rejected
              <Badge variant="secondary" className="ml-2">{stats.rejected}</Badge>
            </Button>
          </div>

        <div className="flex gap-2">
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </span>
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button onClick={exportResults} disabled={groups.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>
    </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No data loaded</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Upload your SKU variant groups JSON file to start reviewing and improving your product catalog
          </p>
          <label htmlFor="file-upload-empty">
            <Button variant="default" size="lg" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-5 w-5 mr-2" />
                Upload JSON File
              </span>
            </Button>
          </label>
          <input
            id="file-upload-empty"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          {filteredGroups.length > 0 && (
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>Showing {filteredGroups.length} of {groups.length} groups</p>
              {filter === 'pending' && filteredGroups.length > 0 && (
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Review progress: {Math.round(((stats.approved + stats.rejected) / stats.total_groups) * 100)}% complete
                </p>
              )}
            </div>
          )}
          
          {filteredGroups.map((group, idx) => (
            <div key={group.id} className="relative">
              {filter === 'pending' && idx === currentIndex && (
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-primary rounded-full" />
              )}
              <VariantGroupCard
                group={group}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          ))}
          
          {filteredGroups.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 
                  `No groups found matching "${searchQuery}"` : 
                  `No ${filter} groups to display`
                }
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}