import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCloset } from '../store/closetStore'
import ClothingCard from '../components/ClothingCard'
import CategoryFilterTabs from '../components/CategoryFilterTabs'

export default function ClosetPage() {
  const { items, loadingItems, removeItem } = useCloset()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredByCategory =
    activeCategory === 'all' ? items : items.filter((item) => item.category === activeCategory)
  const filtered = normalizedSearch
    ? filteredByCategory.filter((item) => {
        const textFields = [
          item.name,
          item.type,
          item.category,
          item.color,
          item.style,
          item.season,
        ]
        return textFields.some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
      })
    : filteredByCategory

  return (
    <div className="page">
      <h2>הארון הדיגיטלי שלי</h2>

      {loadingItems ? (
        <p className="status status--loading">טוענת את הארון שלך...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>הארון שלך ריק כרגע.</p>
          <Link to="/upload" className="btn btn--primary">
            העלאת תמונות ראשונות
          </Link>
        </div>
      ) : (
        <>
          <div className="closet-page__controls">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="חפש בארון לפי סוג, צבע, קטגוריה, עונה או סגנון"
              className="search-input"
              aria-label="חיפוש בארון"
            />
          </div>
          <CategoryFilterTabs active={activeCategory} onChange={setActiveCategory} />
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>לא נמצאו פריטים בארון התואמים לחיפוש או לסינון.</p>
            </div>
          ) : (
            <div className="closet-grid">
              {filtered.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  showDuplicateButton={true}
                />
              ))}
            </div>
          )}
          <Link to="/outfit-builder" className="btn btn--primary">
            בניית לוק מהארון שלי
          </Link>
        </>
      )}
    </div>
  )
}
