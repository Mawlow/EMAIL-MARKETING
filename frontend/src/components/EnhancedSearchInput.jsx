import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, Mail, Users, Building2, X, ChevronRight } from 'lucide-react';
import { auth } from '../api/client';
import styles from './EnhancedSearchInput.module.css';

const RECENT_SEARCHES_KEY_PREFIX = 'fh_recent_';

export default function EnhancedSearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  type = "general", 
  align = "left" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ 
    autocomplete: [], 
    live: { campaigns: [], contacts: [], companies: [] }
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const recentKey = RECENT_SEARCHES_KEY_PREFIX + type;
  const navigate = useNavigate();

  // Flattened items for keyboard navigation
  const getFlattenedItems = () => {
    const items = [];
    
    if (value.length < 2) {
      recentSearches.forEach(s => items.push({ type: 'recent', data: s }));
    } else {
      results.autocomplete.forEach(s => items.push({ type: 'suggestion', data: s }));
      results.live.campaigns.forEach(c => items.push({ type: 'campaign', data: c }));
      results.live.contacts.forEach(c => items.push({ type: 'contact', data: c }));
      results.live.companies.forEach(c => items.push({ type: 'company', data: c }));
    }
    
    return items;
  };

  const flattenedItems = getFlattenedItems();

  useEffect(() => {
    loadRecent();

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [recentKey]);

  const loadRecent = () => {
    const stored = localStorage.getItem(recentKey);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  };

  const performSearch = async (val) => {
    if (!val || val.length < 2) {
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    try {
      const { data } = await auth.search(val);
      setResults(data);
      setActiveIndex(-1);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      performSearch(val);
    }, 300);
  };

  const saveToRecent = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') return;
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(recentKey, JSON.stringify(updated));
  };

  const handleItemClick = (itemType, itemData) => {
    setIsOpen(false);
    
    if (itemType === 'recent' || itemType === 'suggestion') {
      const term = typeof itemData === 'string' ? itemData : itemData.name || itemData.email;
      onChange(term);
      saveToRecent(term);
    } else if (itemType === 'campaign') {
      saveToRecent(itemData.name);
      navigate(`/campaigns/${itemData.id}`);
    } else if (itemType === 'contact') {
      saveToRecent(itemData.email);
      navigate(`/contacts?id=${itemData.id}`);
    } else if (itemType === 'company') {
      saveToRecent(itemData.name);
      navigate(`/admin/companies/${itemData.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < flattenedItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < flattenedItems.length) {
        e.preventDefault();
        const item = flattenedItems[activeIndex];
        handleItemClick(item.type, item.data);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearRecent = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(recentKey);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <Search className={styles.searchIcon} size={18} />
      <input
        ref={inputRef}
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {isOpen && (
        <div className={`${styles.dropdown} ${align === 'right' ? styles.dropdownRight : ''}`}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.loadingDots}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          {!loading && value.length < 2 && (
            <>
              {recentSearches.length > 0 ? (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Recent Searches</span>
                    <button className={styles.clearBtn} onClick={clearRecent}>Clear History</button>
                  </div>
                  {recentSearches.map((s, i) => {
                    const globalIdx = i;
                    return (
                      <button 
                        key={`recent-${i}`} 
                        className={`${styles.item} ${activeIndex === globalIdx ? styles.itemActive : ''}`} 
                        onClick={() => handleItemClick('recent', s)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <Clock className={styles.itemIcon} size={16} />
                        <span className={styles.itemText}>{s}</span>
                        <ChevronRight className={styles.itemArrow} size={14} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noResults}>
                  Start typing to see suggestions
                </div>
              )}
            </>
          )}

          {!loading && value.length >= 2 && (
            <>
              {results.autocomplete.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Suggested Searches</span>
                  </div>
                  {results.autocomplete.map((s, i) => {
                    const globalIdx = i;
                    return (
                      <button 
                        key={`suggest-${i}`} 
                        className={`${styles.item} ${activeIndex === globalIdx ? styles.itemActive : ''}`} 
                        onClick={() => handleItemClick('suggestion', s)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <TrendingUp className={styles.itemIcon} size={16} />
                        <span className={styles.itemText}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {results.live.campaigns.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Campaigns</span>
                  </div>
                  {results.live.campaigns.map((c, i) => {
                    const globalIdx = results.autocomplete.length + i;
                    return (
                      <button 
                        key={`camp-${c.id}`} 
                        className={`${styles.item} ${activeIndex === globalIdx ? styles.itemActive : ''}`} 
                        onClick={() => handleItemClick('campaign', c)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <Mail className={styles.itemIcon} size={16} />
                        <div className={styles.itemText}>
                          {c.name}
                          <span className={styles.itemSubtext}>{c.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {results.live.contacts.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Contacts</span>
                  </div>
                  {results.live.contacts.map((c, i) => {
                    const globalIdx = results.autocomplete.length + results.live.campaigns.length + i;
                    return (
                      <button 
                        key={`cont-${c.id}`} 
                        className={`${styles.item} ${activeIndex === globalIdx ? styles.itemActive : ''}`} 
                        onClick={() => handleItemClick('contact', c)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <Users className={styles.itemIcon} size={16} />
                        <div className={styles.itemText}>
                          {c.first_name} {c.last_name}
                          <span className={styles.itemSubtext}>{c.email}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {results.live.companies.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Companies</span>
                  </div>
                  {results.live.companies.map((c, i) => {
                    const globalIdx = results.autocomplete.length + results.live.campaigns.length + results.live.contacts.length + i;
                    return (
                      <button 
                        key={`comp-${c.id}`} 
                        className={`${styles.item} ${activeIndex === globalIdx ? styles.itemActive : ''}`} 
                        onClick={() => handleItemClick('company', c)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <Building2 className={styles.itemIcon} size={16} />
                        <span className={styles.itemText}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {flattenedItems.length === 0 && (
                <div className={styles.noResults}>
                  No results found for "{value}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}