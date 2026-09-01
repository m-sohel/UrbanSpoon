import { useState, useMemo } from 'react';
import menuItems, { categories } from '../data/menuData';
import MenuCard from '../components/MenuCard';
import MenuFilter from '../components/MenuFilter';
import './Menu.css';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="page menu-page" id="page-menu">
      {/* Page Header banner */}
      <section className="page-header">
        <div className="container">
          <span className="section__label">Culinary Delights</span>
          <h1 className="section__title">Our Curated Menu</h1>
          <div className="divider divider--center"></div>
          <p className="section__subtitle">
            Explore our chef-crafted selections prepared fresh daily with the finest seasonal ingredients.
          </p>
        </div>
      </section>

      {/* Menu Content Section */}
      <section className="section menu-section">
        <div className="container">
          {/* Controls: Search & Category Filter */}
          <div className="menu-controls">
            <div className="menu-search-wrapper">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="menu-search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="form-input menu-search-input"
                placeholder="Search dishes or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="menu-search"
              />
              {searchQuery && (
                <button
                  className="menu-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <MenuFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* Result Count */}
          <div className="menu-meta">
            <span className="menu-meta__count">
              Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'item' : 'items'}
              {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            </span>
          </div>

          {/* Grid of Menu Items */}
          {filteredItems.length > 0 ? (
            <div className="menu-grid stagger-children">
              {filteredItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="menu-empty card text-center" id="menu-no-results">
              <div className="menu-empty__icon">🔍</div>
              <h3 className="section__title" style={{ fontSize: 'var(--text-xl)' }}>No dishes found</h3>
              <p className="section__subtitle" style={{ margin: '0 auto' }}>
                We couldn&rsquo;t find anything matching your search criteria. Try a different category or search keyword.
              </p>
              <button
                className="btn btn--outline mt-lg"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Menu;
