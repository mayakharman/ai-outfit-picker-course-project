import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCloset } from '../store/closetStore'
import ClothingCard from '../components/ClothingCard'
import CategoryFilterTabs from '../components/CategoryFilterTabs'

export default function ClosetPage() {
  const { items, loadingItems, removeItem } = useCloset()
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)

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
          <CategoryFilterTabs active={activeCategory} onChange={setActiveCategory} />
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
          <Link to="/outfit-builder" className="btn btn--primary">
            בניית לוק מהארון שלי
          </Link>
        </>
      )}
    </div>
  )
}
