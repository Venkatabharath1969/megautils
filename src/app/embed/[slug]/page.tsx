import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EmbedToolPage({ params }: Props) {
  const { slug } = await params

  let ToolComponent: React.ComponentType
  try {
    const mod = await import(`@/tools/${slug}/page`)
    ToolComponent = mod.default
  } catch {
    notFound()
  }

  return (
    <div className="p-4">
      <ToolComponent />
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <span>Powered by</span>
        <a
          href={`https://utilsnow.com/tools/${slug}?ref=embed`}
          target="_blank"
          rel="noopener"
          className="text-primary font-semibold hover:underline"
        >
          UtilsNow
        </a>
        <span>&mdash; 191 Free Tools</span>
      </div>
    </div>
  )
}
