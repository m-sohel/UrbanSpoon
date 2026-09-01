import './MenuCard.css';

const MenuCard = ({ item }) => {
  const categoryIcons = {
    'Starters': '🥗',
    'Main Course': '🍽️',
    'Desserts': '🍰',
    'Beverages': '🥤',
  };

  return (
    <div className="menu-card card" id={`menu-item-${item.id}`}>
      <div className="menu-card__header">
        <div className="menu-card__icon">{categoryIcons[item.category] || '🍴'}</div>
        <span className="badge">{item.category}</span>
      </div>
      <div className="menu-card__body">
        <div className="menu-card__title-row">
          <h3 className="menu-card__name">{item.name}</h3>
          <span className="menu-card__price">₹{item.price}</span>
        </div>
        <p className="menu-card__description">{item.description}</p>
      </div>
      <div className="menu-card__footer">
        <div className="menu-card__dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
