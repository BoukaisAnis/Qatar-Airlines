// User Profile Manager
class UserProfileManager {
    constructor() {
        this.user = null;
        this.token = null;
    }

    // Initialize user profile
    async init() {
        // Check authentication
        if (!this.checkAuthentication()) {
            return false;
        }

        // Load user data
        await this.loadUserData();
        
        // Update UI
        this.updateUI();
        
        // Add event listeners
        this.addEventListeners();
        
        return true;
    }

    // Check if user is authenticated
    checkAuthentication() {
        this.token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!this.token || !storedUser) {
            // Redirect to login page
            window.location.href = 'login.html';
            return false;
        }
        
        this.user = JSON.parse(storedUser);
        return true;
    }

    // Load user data from API
    async loadUserData() {
        try {
            const response = await fetch('http://localhost:3000/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
            }
        } catch (error) {
            console.log('Using cached user data:', error.message);
        }
    }

    // Update UI with user data
    updateUI() {
        if (!this.user) return;

        // Update user name
        const userName = `${this.user.firstName} ${this.user.lastName}`;
        document.getElementById('userName').textContent = userName;
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `Welcome Back, <span class="personal-welcome">${this.user.firstName}</span>!`;
        }

        // Update user tier
        this.updateTierDisplay();

        // Update avatar
        this.updateAvatar(userName);

        // Update stats
        this.updateStats();

        // Update sidebar badge
        this.updateSidebar();
    }

    // Update tier display
    updateTierDisplay() {
        const tierElement = document.getElementById('userTier');
        const statusElement = document.getElementById('userStatus');
        
        if (tierElement) {
            tierElement.textContent = this.user.tier;
            tierElement.className = `tier-${this.user.tier.toLowerCase()}`;
        }
        
        if (statusElement) {
            statusElement.textContent = this.user.tier;
            statusElement.className = `tier-${this.user.tier.toLowerCase()}`;
        }
    }

    // Update user avatar
    updateAvatar(userName) {
        const avatarImage = document.getElementById('avatarImage');
        const avatarContainer = document.getElementById('userAvatar');
        
        if (!avatarImage) return;

        const initials = `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c0029&color=fff&bold=true&size=128`;
        
        avatarImage.src = avatarUrl;
        avatarImage.alt = `${userName}'s Avatar`;
        
        if (avatarContainer) {
            avatarContainer.className = `user-avatar tier-${this.user.tier.toLowerCase()}`;
        }
    }

    // Update statistics
    updateStats() {
        // Update Avios balance
        const aviosBalance = document.getElementById('aviosBalance');
        const sidebarAvios = document.getElementById('sidebarAvios');
        
        if (aviosBalance) {
            aviosBalance.textContent = this.user.avios.toLocaleString();
        }
        
        if (sidebarAvios) {
            sidebarAvios.textContent = this.user.avios.toLocaleString();
        }

        // Update Avios description
        const aviosDesc = document.getElementById('aviosDesc');
        if (aviosDesc) {
            aviosDesc.textContent = `+2,000 bonus on signup`;
        }

        // Update other stats (demo data)
        const travelDays = Math.floor(Math.random() * 100) + 10;
        const countries = Math.floor(Math.random() * 20) + 5;
        const upcomingFlights = Math.floor(Math.random() * 5) + 1;
        
        document.getElementById('travelDays').textContent = travelDays;
        document.getElementById('countriesVisited').textContent = countries;
        document.getElementById('upcomingFlights').textContent = upcomingFlights;
        
        const userStats = document.getElementById('userStats');
        if (userStats) {
            userStats.textContent = `${travelDays} travel days • ${countries} countries visited • ${upcomingFlights} upcoming flights`;
        }

        // Update next flight (demo)
        const nextFlight = document.getElementById('nextFlight');
        if (nextFlight) {
            const destinations = ['Paris', 'London', 'New York', 'Tokyo', 'Sydney'];
            const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
            nextFlight.textContent = `Next: Doha to ${randomDest}`;
        }
    }

    // Update sidebar info
    updateSidebar() {
        const tierPoints = document.getElementById('tierPoints');
        if (tierPoints) {
            // Calculate tier points based on Avios
            const points = Math.min(1000, Math.floor(this.user.avios / 10));
            tierPoints.textContent = points;
        }
    }

    // Add event listeners
    addEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.querySelector('span').textContent;
                alert(`${action} feature for ${this.user.firstName} coming soon!`);
            });
        });

        // New booking button
        const newBookingBtn = document.querySelector('.btn-new-booking');
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', () => {
                alert(`Starting new booking for ${this.user.firstName}...`);
            });
        }
    }

    // Logout function
    logout() {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Optional: Call backend logout endpoint
        fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.log('Logout API error:', error);
        }).finally(() => {
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }

    // Get user data for other scripts
    getUser() {
        return this.user;
    }

    // Get token for API calls
    getToken() {
        return this.token;
    }
}

// Initialize user profile when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const userProfile = new UserProfileManager();
    const isAuthenticated = await userProfile.init();
    
    if (isAuthenticated) {
        console.log('User profile loaded:', userProfile.getUser().firstName);
    }
});