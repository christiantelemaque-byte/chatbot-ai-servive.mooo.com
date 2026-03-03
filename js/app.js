// js/app.js – with country filter
console.log('✅ app.js loaded');

class EscortDirectory {
    constructor() {
        this.fallbackPosts = JSON.parse(localStorage.getItem('luxePosts')) || [];
        this.allPosts = [];               // store all fetched posts
        this.currentCountryFilter = '';   // current filter
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        this.loadListings();
        this.setupFilterListener();
        this.setupEventListeners();
    }

    setupFilterListener() {
        const filterSelect = document.getElementById('countryFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentCountryFilter = e.target.value;
                this.displayFilteredPosts();
            });
        }
    }

    async loadListings() {
        const vipContainer = document.getElementById('vip-listings');
        const regularContainer = document.getElementById('regular-listings');
        if (!vipContainer && !regularContainer) return;

        if (vipContainer) vipContainer.innerHTML = '<div class="loading">Loading VIP listings...</div>';
        if (regularContainer) regularContainer.innerHTML = '<div class="loading">Loading regular listings...</div>';

        // Try cache first
        const cachedPosts = (typeof getPublicPosts === 'function') ? getPublicPosts() : null;
        if (cachedPosts && cachedPosts.length > 0) {
            this.allPosts = cachedPosts;
            this.populateCountryFilter();
            this.displayFilteredPosts();
            this.refreshListings(); // background refresh
        } else {
            await this.refreshListings();
        }
    }

    async refreshListings() {
        try {
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                console.warn('Supabase not available, using fallback');
                this.displayFallback();
                return;
            }

            // Attempt 1: with join (requires proper RLS)
            let posts = null;
            let error = null;
            try {
                const { data, error: err } = await window.supabase
                    .from('posts')
                    .select('*, profiles(username)')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                posts = data;
                error = err;
            } catch (joinErr) {
                console.warn('Join query failed, trying without join:', joinErr);
            }

            if (error || !posts) {
                console.warn('Falling back to basic posts query');
                const { data, error: err } = await window.supabase
                    .from('posts')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                posts = data;
                error = err;
            }

            if (error) {
                console.error('Supabase error:', error);
                this.displayFallback();
                return;
            }

            if (!posts || posts.length === 0) {
                this.displayNoPosts();
                return;
            }

            this.allPosts = posts;
            if (typeof setPublicPosts === 'function') setPublicPosts(posts);
            this.populateCountryFilter();
            this.displayFilteredPosts();
        } catch (err) {
            console.error('Unexpected error in refreshListings:', err);
            this.displayFallback();
        }
    }

    populateCountryFilter() {
        const select = document.getElementById('countryFilter');
        if (!select) return;
        // Extract unique countries
        const countries = [...new Set(this.allPosts
            .map(p => p.location?.country)
            .filter(c => c && c.trim() !== '')
        )].sort();
        select.innerHTML = '<option value="">All Countries</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            select.appendChild(option);
        });
    }

    displayFilteredPosts() {
        const filtered = this.currentCountryFilter
            ? this.allPosts.filter(p => p.location?.country === this.currentCountryFilter)
            : this.allPosts;

        const vipContainer = document.getElementById('vip-listings');
        const regularContainer = document.getElementById('regular-listings');
        this.displayPosts(filtered, vipContainer, regularContainer);
    }

    displayPosts(posts, vipContainer, regularContainer) {
        const vipPosts = posts.filter(p => p.is_vip === true);
        const regularPosts = posts.filter(p => p.is_vip !== true);

        if (vipContainer) {
            vipContainer.innerHTML = '';
            if (vipPosts.length > 0) {
                vipPosts.slice(0, 6).forEach(p => vipContainer.appendChild(this.createPostCard(p)));
            } else {
                vipContainer.innerHTML = '<div class="no-listings">No VIP listings yet</div>';
            }
        }

        if (regularContainer) {
            regularContainer.innerHTML = '';
            if (regularPosts.length > 0) {
                regularPosts.slice(0, 12).forEach(p => regularContainer.appendChild(this.createPostCard(p)));
            } else {
                regularContainer.innerHTML = '<div class="no-listings">No regular listings yet</div>';
            }
        }
    }

    displayFallback() {
        const vipContainer = document.getElementById('vip-listings');
        const regularContainer = document.getElementById('regular-listings');
        const vipFallback = this.fallbackPosts.filter(p => p.subscriptionType === 'vip' && p.status === 'active');
        const regularFallback = this.fallbackPosts.filter(p => p.subscriptionType === 'regular' && p.status === 'active');

        if (vipContainer) {
            vipContainer.innerHTML = '';
            if (vipFallback.length > 0) {
                vipFallback.slice(0, 6).forEach(p => vipContainer.appendChild(this.createPostCard(p)));
            } else {
                vipContainer.innerHTML = '<div class="no-listings">No VIP listings (demo mode)</div>';
            }
        }

        if (regularContainer) {
            regularContainer.innerHTML = '';
            if (regularFallback.length > 0) {
                regularFallback.slice(0, 12).forEach(p => regularContainer.appendChild(this.createPostCard(p)));
            } else {
                regularContainer.innerHTML = '<div class="no-listings">No regular listings (demo mode)</div>';
            }
        }
    }

    displayNoPosts() {
        const vipContainer = document.getElementById('vip-listings');
        const regularContainer = document.getElementById('regular-listings');
        if (vipContainer) vipContainer.innerHTML = '<div class="no-listings">No VIP listings yet</div>';
        if (regularContainer) regularContainer.innerHTML = '<div class="no-listings">No regular listings yet</div>';
    }

    createPostCard(post) {
        const card = document.createElement('div');
        card.className = `listing-card ${post.is_vip ? 'vip-card' : ''}`;
        card.addEventListener('click', () => {
            window.location.href = `post.html?id=${post.id}`;
        });
        card.style.cursor = 'pointer';

        const title = post.title || (post.is_vip ? 'VIP Companion' : 'Companion');
        const desc = post.description || 'No description provided.';
        const imageUrl = (post.images && post.images[0]) ? post.images[0] : 'images/default-avatar.jpg';
        const date = post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : 'Recently';
        const username = post.profiles?.username || post.username || (post.user_id ? 'User' : 'Anonymous');

        const locationHtml = post.location?.country
            ? `<span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(post.location.country)}</span>`
            : '';

        card.innerHTML = `
            ${post.is_vip ? '<div class="vip-badge"><i class="fas fa-crown"></i> VIP</div>' : ''}
            <img src="${imageUrl}" class="listing-image" onerror="this.src='images/default-avatar.jpg'">
            <div class="listing-content">
                <h3>${this.escapeHtml(title.substring(0, 50))}</h3>
                <p class="listing-description">${this.escapeHtml(desc.substring(0, 100))}...</p>
                <div class="listing-meta">
                    <span><i class="fas fa-user"></i> ${this.escapeHtml(username)}</span>
                    <span><i class="fas fa-clock"></i> ${date}</span>
                    ${locationHtml}
                </div>
            </div>
        `;
        return card;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupEventListeners() {}
}

const app = new EscortDirectory();
