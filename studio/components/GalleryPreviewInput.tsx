import { type InputProps, type ArrayOfObjectsInputProps, useClient } from 'sanity'
import { useMemo } from 'react'
import { createImageUrlBuilder } from '@sanity/image-url'
import { parseDimensions } from '../lib/imageUtils'

interface GalleryImage {
  _key: string
  _type: string
  asset?: { _ref: string }
  size?: string
}

type SpanType = 'span-full' | 'span-2' | 'span-2-right' | 'span-1' | 'span-1-short'

function getSpan(size: string | undefined, url: string): SpanType {
  switch (size) {
    case 'full': return 'span-full'
    case 'half': return 'span-2'
    case 'offset-left': return 'span-2'
    case 'offset-right': return 'span-2-right'
    case 'small': return 'span-1-short'
    default: {
      const dims = parseDimensions(url)
      if (dims && dims.width < dims.height) return 'span-1'
      return 'span-2'
    }
  }
}

const SPAN_LABELS: Record<SpanType, string> = {
  'span-full': 'Full',
  'span-2': '2 col',
  'span-2-right': '2 col R',
  'span-1': '1 col',
  'span-1-short': '1 col S',
}

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridAutoRows: 40,
  gridAutoFlow: 'dense',
  gap: 1,
  background: '#e0e0e0',
}

function itemStyle(span: SpanType): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 1,
  }
  switch (span) {
    case 'span-full': return { ...base, gridColumn: 'span 5', gridRow: 'span 2' }
    case 'span-2': return { ...base, gridColumn: 'span 2', gridRow: 'span 2' }
    case 'span-2-right': return { ...base, gridColumn: '4 / -1', gridRow: 'span 2' }
    case 'span-1': return { ...base, gridColumn: 'span 1', gridRow: 'span 2' }
    case 'span-1-short': return { ...base, gridColumn: 'span 1', gridRow: 'span 1' }
  }
}

export default function GalleryPreviewInput(props: InputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const builder = useMemo(() => createImageUrlBuilder(client), [client])
  const value = (props.value as GalleryImage[] | undefined) || []

  const items = useMemo(() => {
    return value
      .filter((item) => item.asset?._ref)
      .map((item) => {
        const rawUrl = builder.image(item.asset!._ref).url()
        return {
          key: item._key,
          thumbUrl: `${rawUrl}?w=200&auto=format&q=50`,
          rawUrl,
          size: item.size || 'auto',
          span: getSpan(item.size, rawUrl),
        }
      })
  }, [value, builder])

  return (
    <div>
      {items.length > 0 ? (
        <div style={{
          background: '#f7f7f7',
          borderRadius: 6,
          padding: 12,
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}>
            Layout Preview
          </div>
          <div style={GRID_STYLE}>
            {items.map((item) => (
              <div key={item.key} style={itemStyle(item.span)}>
                <img
                  src={item.thumbUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 3,
                  fontSize: 8,
                  color: '#fff',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '1px 3px',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  lineHeight: 1.2,
                }}>
                  {SPAN_LABELS[item.span]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#f7f7f7',
          borderRadius: 6,
          padding: '16px 12px',
          marginBottom: 16,
          fontSize: 12,
          color: '#999',
          textAlign: 'center' as const,
        }}>
          Add images to see layout preview
        </div>
      )}
      {(props as ArrayOfObjectsInputProps).renderDefault(props)}
    </div>
  )
}
