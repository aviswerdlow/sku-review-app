"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { VariantGroup } from '@/lib/types'
import { Check, X, ChevronDown, ChevronUp, Package, AlertCircle, Sparkles, Scale, Info, Edit2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VariantGroupCardProps {
  group: VariantGroup
  onApprove: (groupId: string) => void
  onReject: (groupId: string, reason: string, feedback: string) => void
  onUndo?: (groupId: string) => void
}

export function VariantGroupCard({ group, onApprove, onReject, onUndo }: VariantGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 300)) // Smooth animation
    onApprove(group.id)
    setIsProcessing(false)
  }

  const handleReject = async () => {
    if (rejectionReason.trim()) {
      setIsProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 300)) // Smooth animation
      onReject(group.id, rejectionReason, feedback)
      setShowRejectForm(false)
      setRejectionReason('')
      setFeedback('')
      setIsProcessing(false)
    }
  }

  const getStatusBadge = () => {
    switch (group.review_status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending Review</Badge>
    }
  }

  const getConfidenceBadge = () => {
    const confidence = Math.round(group.confidence * 100)
    if (confidence >= 90) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {confidence}% Confidence
        </Badge>
      )
    } else if (confidence >= 75) {
      return <Badge variant="secondary">{confidence}% Confidence</Badge>
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {confidence}% Confidence
        </Badge>
      )
    }
  }

  return (
    <Card className={cn(
      "mb-4 transition-all duration-200 hover:shadow-lg",
      group.review_status === 'approved' && "border-green-200 bg-green-50/30",
      group.review_status === 'rejected' && "border-red-200 bg-red-50/30",
      isProcessing && "opacity-70 pointer-events-none"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              {group.parent_title}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-4">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {group.parent_sku}
              </span>
              <span className="flex items-center gap-1">
                <Scale className="h-3 w-3" />
                {group.variant_count} variants
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {getStatusBadge()}
            {getConfidenceBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Reasoning
            </h4>
            <p className="text-sm text-muted-foreground italic">"{group.reasoning}"</p>
          </div>

          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mb-2 transition-all hover:bg-primary/10"
            >
              {isExpanded ? (
                <>Hide {group.variants?.length || group.variant_count} Variants <ChevronUp className="ml-2 h-4 w-4 transition-transform" /></>
              ) : (
                <>Show {group.variants?.length || group.variant_count} Variants <ChevronDown className="ml-2 h-4 w-4 transition-transform" /></>
              )}
            </Button>
            
            {isExpanded && (
              <div className="border rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto bg-background animate-in slide-in-from-top-2 duration-200">
                {group.variants.map((variant, idx) => (
                  <div key={variant.sku} className="text-sm p-2 rounded hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-primary">
                    <div className="flex items-start gap-2">
                      <span className="text-xs bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {variant.original_title ? (
                            <TooltipProvider>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 cursor-help">
                                    <span>{variant.title}</span>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-md p-3 bg-popover border">
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold">Original Product Title:</p>
                                    <p className="text-xs font-normal leading-relaxed break-words">
                                      {variant.original_title}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span>{variant.title || `Product ${variant.sku}`}</span>
                          )}
                        </div>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded inline-block mt-1">{variant.sku}</code>
                      </div>
                    </div>
                    {variant.attributes && (
                      <div className="flex flex-wrap gap-1 ml-7 mt-2">
                        {variant.attributes.base_product && variant.attributes.base_product !== 'unknown' && (
                          <Badge variant="default" className="text-xs py-0 h-5">
                            {variant.attributes.base_product}
                          </Badge>
                        )}
                        {variant.attributes.weight && (
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            {variant.attributes.weight} {variant.attributes.weight_unit || 'unit'}
                          </Badge>
                        )}
                        {variant.attributes.weight_min && (
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            {variant.attributes.weight_min}-{variant.attributes.weight_max} {variant.attributes.weight_unit || 'unit'}
                          </Badge>
                        )}
                        {variant.attributes.preparation && (
                          <Badge variant="secondary" className="text-xs py-0 h-5">
                            {variant.attributes.preparation}
                          </Badge>
                        )}
                        {variant.attributes.kosher && (
                          <Badge variant="default" className="text-xs py-0 h-5">Kosher</Badge>
                        )}
                        {variant.attributes.organic && (
                          <Badge variant="default" className="text-xs py-0 h-5">Organic</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {group.common_attributes && Object.keys(group.common_attributes).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Common Attributes:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(group.common_attributes).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {group.varying_attributes && group.varying_attributes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Varying Attributes:</h4>
              <div className="flex flex-wrap gap-2">
                {group.varying_attributes.map((attr) => (
                  <Badge key={attr} variant="secondary">
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {group.review_status === 'rejected' && group.rejection_reason && (
            <div className="border-l-4 border-destructive bg-destructive/10 p-3 rounded">
              <h4 className="font-semibold text-destructive mb-1">Rejection Reason:</h4>
              <p className="text-sm">{group.rejection_reason}</p>
              {group.feedback && (
                <>
                  <h4 className="font-semibold text-destructive mb-1 mt-2">Feedback:</h4>
                  <p className="text-sm">{group.feedback}</p>
                </>
              )}
            </div>
          )}

          {showRejectForm && (
            <div className="border-2 border-destructive/50 rounded-lg p-4 space-y-3 bg-destructive/5 animate-in slide-in-from-top-2 duration-200">
              <h4 className="font-semibold flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Rejection Details
              </h4>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Reason for rejection *
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., These products are not variants - they have different cuts"
                  className="min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Additional feedback (optional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., Product 1 is bone-in while product 2 is boneless"
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason('')
                    setFeedback('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {group.review_status === 'pending' && (
        <CardFooter className="flex justify-between bg-muted/30">
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              className="flex items-center gap-2 transition-all hover:scale-105"
              disabled={isProcessing}
            >
              <Check className="h-4 w-4" />
              Approve Group
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="flex items-center gap-2 transition-all hover:scale-105"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              Reject Group
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {group.reviewer_email && `Last reviewed by ${group.reviewer_email}`}
          </div>
        </CardFooter>
      )}

      {(group.review_status === 'approved' || group.review_status === 'rejected') && (
        <CardFooter className="flex justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {group.review_status === 'approved' ? 'Approved' : 'Rejected'} by {group.reviewer_email || 'Unknown'}
              {group.review_date && ` on ${new Date(group.review_date).toLocaleDateString()}`}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onUndo) {
                onUndo(group.id);
              }
            }}
            className="flex items-center gap-1.5 hover:bg-background"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo Review
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}