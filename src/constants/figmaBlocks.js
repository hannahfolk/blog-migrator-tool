import { Image, Layout, Play, LayoutGrid, FileText, Target, Minus } from 'lucide-react'

export const FIGMA_BLOCKS = {
  fullWidth: {
    label: 'Full Width',
    icon: Image,
    color: '#ec4899',
    description: 'Hero image spanning full width',
    hasImages: true,
    imageCount: 1,
    hasCTA: false,
    prefix: 'blog__full-width'
  },
  oneUp: {
    label: '1-Up',
    icon: Image,
    color: '#8b5cf6',
    description: 'Heading + body + single image with label + CTA',
    hasImages: true,
    imageCount: 1,
    hasCTA: true,
    prefix: 'blog__one-up'
  },
  twoUp: {
    label: '2-Up',
    icon: Layout,
    color: '#10b981',
    description: 'Heading + body + 2 images with labels + CTA',
    hasImages: true,
    imageCount: 2,
    hasCTA: true,
    prefix: 'blog__two-up'
  },
  threeUp: {
    label: '3-Up',
    icon: Layout,
    color: '#f59e0b',
    description: 'Heading + body + 3 images with labels + CTA',
    hasImages: true,
    imageCount: 3,
    hasCTA: true,
    prefix: 'blog__three-up'
  },
  video: {
    label: 'Video',
    icon: Play,
    color: '#ef4444',
    description: 'Heading + body + embedded video',
    hasImages: false,
    hasCTA: false,
    prefix: 'blog__video'
  },
  twoByTwo: {
    label: '2 x 2',
    icon: LayoutGrid,
    color: '#14b8a6',
    description: 'Heading + body + 4 images in 2x2 grid + CTA',
    hasImages: true,
    imageCount: 4,
    hasCTA: true,
    prefix: 'blog__two-by-two'
  },
  threeByTwo: {
    label: '3 x 2',
    icon: LayoutGrid,
    color: '#06b6d4',
    description: 'Heading + body + 6 images in 3x2 grid + CTA',
    hasImages: true,
    imageCount: 6,
    hasCTA: true,
    prefix: 'blog__three-by-two'
  },
  richText: {
    label: 'Rich Text',
    icon: FileText,
    color: '#3b82f6',
    description: 'Heading + body copy (no images)',
    hasImages: false,
    hasCTA: false,
    prefix: 'blog__rich-text'
  },
  hotspot: {
    label: 'Hotspot',
    icon: Target,
    color: '#f97316',
    description: 'Image with clickable hotspot markers',
    hasImages: false,
    hasCTA: false,
    prefix: 'blog__hotspot'
  },
  hr: {
    label: 'Divider',
    icon: Minus,
    color: '#a1a1aa',
    description: 'Horizontal line with custom color',
    hasImages: false,
    hasCTA: false,
    prefix: 'blog__divider'
  },
}
