import { CATEGORIES } from '../data/constants'

export default function CategoryFilterTabs({ active, onChange }) {
  return (
    <div className="filter-tabs">
      <button
        className={'filter-tabs__tab' + (active === 'all' ? ' filter-tabs__tab--active' : '')}
        onClick={() => onChange('all')}
      >
        הכל
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          className={'filter-tabs__tab' + (active === cat.key ? ' filter-tabs__tab--active' : '')}
          onClick={() => onChange(cat.key)}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  )
}
