import { createContext, useContext, useEffect, useState } from 'react'
import { applyColorTint } from '../utils/imageProcessing'
import { COLOR_OPTIONS } from '../data/constants'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import { useAuth } from './authStore'

const STORAGE_KEY = 'ai-outfit-picker.closet'
const LOOKS_STORAGE_KEY = 'ai-outfit-picker.saved-looks'
const TABLE = 'wardrobe_items'

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLooksToStorage(looks) {
  localStorage.setItem(LOOKS_STORAGE_KEY, JSON.stringify(looks))
}

// --- Supabase row <-> app item field mapping ---
function rowToItem(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    category: row.category,
    color: row.color,
    style: row.style,
    season: row.season,
    sourceImage: row.source_image,
    productImageUrl: row.product_image_url,
    needsManualFix: row.needs_manual_fix,
    isPlaceholder: row.is_placeholder,
    error: row.error,
    duplicateOf: row.duplicate_of,
  }
}

function itemToRow(item, userId) {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    type: item.type,
    category: item.category,
    color: item.color,
    style: item.style,
    season: item.season,
    source_image: item.sourceImage,
    product_image_url: item.productImageUrl,
    needs_manual_fix: item.needsManualFix || false,
    is_placeholder: item.isPlaceholder || false,
    error: item.error || null,
    duplicate_of: item.duplicateOf || null,
  }
}

const ClosetContext = createContext(null)

export function ClosetProvider({ children }) {
  const { user } = useAuth()
  // No Supabase configured -> behave exactly as before (localStorage,
  // no accounts). Supabase configured -> wardrobe lives in the database,
  // scoped to the signed-in user; logged out means an empty closet.
  const useDb = isSupabaseConfigured && Boolean(user)

  const [items, setItems] = useState(() => (isSupabaseConfigured ? [] : loadFromStorage(STORAGE_KEY)))
  const [loadingItems, setLoadingItems] = useState(useDb)
  const [savedLooks, setSavedLooks] = useState(() => loadFromStorage(LOOKS_STORAGE_KEY))

  useEffect(() => {
    if (isSupabaseConfigured) return // DB path persists itself per-call
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    saveLooksToStorage(savedLooks)
  }, [savedLooks])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!user) {
      setItems([])
      setLoadingItems(false)
      return
    }

    let cancelled = false
    setLoadingItems(true)
    supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to load wardrobe items:', error)
          setItems([])
        } else {
          setItems(data.map(rowToItem))
        }
        setLoadingItems(false)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  async function addItems(newItems) {
    if (!useDb) {
      setItems((prev) => [...prev, ...newItems])
      return
    }
    const withIds = newItems.map((item) => ({ ...item, id: item.id || crypto.randomUUID() }))
    const { data, error } = await supabase
      .from(TABLE)
      .insert(withIds.map((item) => itemToRow(item, user.id)))
      .select()
    if (error) {
      console.error('Failed to add wardrobe items:', error)
      return
    }
    setItems((prev) => [...prev, ...data.map(rowToItem)])
  }

  async function updateItem(id, patch) {
    if (!useDb) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
      return
    }
    const current = items.find((i) => i.id === id)
    if (!current) return
    const merged = { ...current, ...patch }
    const row = itemToRow(merged, user.id)
    delete row.id
    const { error } = await supabase.from(TABLE).update(row).eq('id', id).eq('user_id', user.id)
    if (error) {
      console.error('Failed to update wardrobe item:', error)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === id ? merged : item)))
  }

  async function removeItem(id) {
    if (!useDb) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', user.id)
    if (error) {
      console.error('Failed to remove wardrobe item:', error)
      return
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  async function duplicateItem(id, newColor) {
    const original = items.find((item) => item.id === id)
    if (!original) return

    let productImageUrl = original.productImageUrl
    const colorChanged = newColor && newColor !== original.color
    if (colorChanged && productImageUrl) {
      const colorOption = COLOR_OPTIONS.find((c) => c.name === newColor)
      if (colorOption) {
        try {
          productImageUrl = await applyColorTint(productImageUrl, colorOption.hex)
        } catch {
          // tinting failed (e.g. tainted canvas) — keep the original photo,
          // the new color tag on the card still communicates the variant
        }
      }
    }

    const duplicate = {
      ...original,
      id: crypto.randomUUID(),
      color: newColor || original.color,
      productImageUrl,
      duplicateOf: id,
    }

    if (!useDb) {
      setItems((prev) => [...prev, duplicate])
      return
    }
    const { data, error } = await supabase.from(TABLE).insert(itemToRow(duplicate, user.id)).select()
    if (error) {
      console.error('Failed to duplicate wardrobe item:', error)
      return
    }
    setItems((prev) => [...prev, rowToItem(data[0])])
  }

  function clearCloset() {
    setItems([])
  }

  function saveLook(look) {
    const entry = { ...look, id: crypto.randomUUID(), savedAt: new Date().toISOString() }
    setSavedLooks((prev) => [entry, ...prev])
    return entry
  }

  const value = {
    items,
    loadingItems,
    addItems,
    updateItem,
    removeItem,
    duplicateItem,
    clearCloset,
    savedLooks,
    saveLook,
  }
  return <ClosetContext.Provider value={value}>{children}</ClosetContext.Provider>
}

export function useCloset() {
  const ctx = useContext(ClosetContext)
  if (!ctx) throw new Error('useCloset must be used within a ClosetProvider')
  return ctx
}
