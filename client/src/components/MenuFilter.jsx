import './MenuFilter.css';

const MenuFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="menu-filter" id="menu-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`menu-filter__btn ${selected === cat ? 'menu-filter__btn--active' : ''}`}
          onClick={() => onSelect(cat)}
          id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default MenuFilter;
