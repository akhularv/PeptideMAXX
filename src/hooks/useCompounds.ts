import { useMemo } from 'react'
import { compounds } from '@/lib/compounds'
import { useAppStore } from '@/store/useAppStore'

/**
 * Compounds hook — returns the full compound list and a filtered subset.
 * Filtering is driven by useAppStore: searchQuery and activeTag.
 * (The store has no separate categoryFilter/evidenceFilter fields; activeTag
 * covers the tag-based filter.)
 *
 * Returns:
 *   compounds: full Compound[] array
 *   filtered: Compound[] after applying current search query and active tag
 */
export function useCompounds() {
  const { activeTag, searchQuery } = useAppStore()

  const filtered = useMemo(() => {
    return compounds.filter((c) => {
      // Tag filter: activeTag null means show all
      if (activeTag && !c.tags.includes(activeTag)) return false

      // Full-text search across name and tags
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [activeTag, searchQuery])

  return { compounds, filtered }
}
