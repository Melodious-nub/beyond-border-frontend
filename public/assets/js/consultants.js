// Consultants page functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const firmFilter = document.getElementById('firmFilter');
    const expertiseFilter = document.getElementById('expertiseFilter');
    const consultantsGrid = document.getElementById('consultantsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Get all consultant cards
    const allConsultants = Array.from(consultantsGrid.querySelectorAll('.consultant-card'));
    let visibleCount = 12; // Show 12 initially
    
    // Filter functionality
    function filterConsultants() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedFirm = firmFilter.value;
        const selectedExpertise = expertiseFilter.value;
        
        let visibleConsultants = allConsultants.filter(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const location = card.querySelector('.location').textContent.toLowerCase();
            const firm = card.dataset.firm;
            const expertise = card.dataset.expertise;
            
            // Search filter
            const matchesSearch = searchTerm === '' || 
                name.includes(searchTerm) || 
                location.includes(searchTerm) ||
                expertise.includes(searchTerm);
            
            // Firm filter
            const matchesFirm = selectedFirm === '' || firm === selectedFirm;
            
            // Expertise filter
            const matchesExpertise = selectedExpertise === '' || expertise === selectedExpertise;
            
            return matchesSearch && matchesFirm && matchesExpertise;
        });
        
        // Hide all consultants first
        allConsultants.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show filtered consultants up to visible count
        visibleConsultants.slice(0, visibleCount).forEach(card => {
            card.style.display = 'block';
        });
        
        // Update load more button
        if (visibleConsultants.length > visibleCount) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More (${visibleConsultants.length - visibleCount} remaining)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
        
        // Show no results message if needed
        if (visibleConsultants.length === 0) {
            showNoResults();
        } else {
            hideNoResults();
        }
        
        return visibleConsultants;
    }
    
    // Show no results message
    function showNoResults() {
        let noResultsMsg = document.getElementById('noResultsMessage');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>No consultants found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            consultantsGrid.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    }
    
    // Hide no results message
    function hideNoResults() {
        const noResultsMsg = document.getElementById('noResultsMessage');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
    
    // Load more functionality
    function loadMore() {
        visibleCount += 12;
        filterConsultants();
    }
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterConsultants, 300));
    }
    
    if (firmFilter) {
        firmFilter.addEventListener('change', filterConsultants);
    }
    
    if (expertiseFilter) {
        expertiseFilter.addEventListener('change', filterConsultants);
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMore);
    }
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Initial filter
    filterConsultants();
    
    // Add consultant card click functionality
    allConsultants.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.querySelector('h4').textContent;
            const location = this.querySelector('.location').textContent;
            const firm = this.querySelector('.firm').textContent;
            
            // You can add modal or redirect functionality here
            console.log(`Clicked on ${name} from ${location} (${firm})`);
            
            // For now, just add a visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Add CSS for no results message
const style = document.createElement('style');
style.textContent = `
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: #666;
    }
    
    .no-results-content i {
        font-size: 3rem;
        color: #ccc;
        margin-bottom: 1rem;
    }
    
    .no-results-content h3 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .no-results-content p {
        font-size: 1rem;
        color: #666;
    }
    
    .consultant-card {
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .consultant-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);

