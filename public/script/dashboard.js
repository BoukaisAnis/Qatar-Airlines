// Dashboard User Profile Management
class DashboardUser {
    constructor() {
        this.user = null;
        this.token = null;
    }

    // Initialize dashboard with user data
    async init() {
        // Check if user is logged in
        if (!this.checkAuth()) {
            return;
        }

        // Load user data
        await this.loadUserData();
        
        // Update dashboard UI
        this.updateDashboard();
        
        // Add event listeners
        this.addEventListeners();
    }

    // Check authentication
    checkAuth() {
        this.token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!this.token || !storedUser) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return false;
        }
        
        this.user = JSON.parse(storedUser);
        return true;
    }

    // Load fresh user data from API
    async loadUserData() {
        try {
            const response = await fetch('http://localhost:3000/api/auth/profile', {
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
            console.log('Using cached user data');
        }
    }

    // Update dashboard with user information
    updateDashboard() {
        if (!this.user) return;

        // Update user name in sidebar
        const userName = `${this.user.firstName} ${this.user.lastName}`;
        document.getElementById('userName').textContent = userName;
        
        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.innerHTML = `Welcome Back, <span style="color: #5c0029;">${this.user.firstName}</span>!`;
        }

        // Update user tier
        const tierElement = document.getElementById('userTier');
        if (tierElement) {
            tierElement.textContent = this.user.tier;
            tierElement.className = `tier-${this.user.tier.toLowerCase()}`;
        }

        // Update avatar with user initials
        this.updateAvatar(userName);

        // Update Avios balance
        const aviosBalance = document.getElementById('aviosBalance');
        if (aviosBalance) {
            aviosBalance.textContent = this.user.avios.toLocaleString();
        }

        // Update upcoming flights count (demo - you would get this from API)
        this.updateStats();
        
        // Update recent bookings and activity
        this.updateRecentData();
    }

    // Update user avatar
    updateAvatar(userName) {
        const avatarImage = document.getElementById('avatarImage');
        if (!avatarImage) return;

        const initials = `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5c0029&color=fff&bold=true&size=128`;
        
        avatarImage.src = avatarUrl;
        avatarImage.alt = `${userName}'s Avatar`;
        
        // Add tier-based border
        const avatarContainer = document.getElementById('userAvatar');
        if (avatarContainer) {
            avatarContainer.className = `user-avatar tier-${this.user.tier.toLowerCase()}`;
        }
    }

    // Update statistics
    updateStats() {
        // Demo stats - in real app, these would come from API
        const travelDays = Math.floor(Math.random() * 100) + 10;
        const countries = Math.floor(Math.random() * 20) + 5;
        
        const userStats = document.getElementById('userStats');
        if (userStats) {
            userStats.innerHTML = `${travelDays} travel days • ${countries} countries visited`;
        }

        // Update upcoming flights count
        const upcomingFlights = Math.floor(Math.random() * 5) + 1;
        const flightsElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
        if (flightsElement) {
            flightsElement.textContent = upcomingFlights;
        }
    }

    // Update recent bookings and activity
    updateRecentData() {
        // Demo recent bookings
        const bookings = [
            {
                id: `#QR${Math.floor(Math.random() * 1000000)}`,
                route: 'DOH → LHR',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                passengers: '2 Adults',
                amount: `$${(Math.random() * 2000 + 800).toFixed(0)}`,
                status: 'Completed'
            },
            {
                id: `#QR${Math.floor(Math.random() * 1000000)}`,
                route: 'DOH → SIN',
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                passengers: '1 Adult',
                amount: `$${(Math.random() * 1500 + 500).toFixed(0)}`,
                status: 'Completed'
            }
        ];

        // Update bookings table
        const tbody = document.querySelector('.bookings-table tbody');
        if (tbody) {
            tbody.innerHTML = bookings.map(booking => `
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.route}</td>
                    <td>${booking.date}</td>
                    <td>${booking.passengers}</td>
                    <td>${booking.amount}</td>
                    <td><span class="badge-success">${booking.status}</span></td>
                </tr>
            `).join('');
        }

        // Update Avios activity
        this.updateAviosActivity();
    }

    // Update Avios activity feed
    updateAviosActivity() {
        const activities = [
            {
                type: 'earned',
                title: 'Flight Bonus',
                description: 'Doha to London',
                amount: 2000,
                date: 'Today',
                icon: 'plane'
            },
            {
                type: 'earned',
                title: 'Hotel Stay',
                description: 'Marriott Paris',
                amount: 500,
                date: 'Dec 10',
                icon: 'hotel'
            },
            {
                type: 'redeemed',
                title: 'Reward Redemption',
                description: 'Lounge Access',
                amount: -1500,
                date: 'Nov 28',
                icon: 'gift'
            }
        ];

        const activityContainer = document.querySelector('.avios-activity');
        if (activityContainer) {
            activityContainer.innerHTML = activities.map(activity => `
                <div class="activity-item ${activity.type}">
                    <div class="activity-icon">
                        <i class="fas fa-${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="activity-date">${activity.date}</span>
                    </div>
                    <div class="activity-amount ${activity.amount > 0 ? 'positive' : 'negative'}">
                        ${activity.amount > 0 ? '+' : ''}${activity.amount.toLocaleString()}
                    </div>
                </div>
            `).join('');
        }

        // Update Avios summary
        const earned = activities.filter(a => a.amount > 0).reduce((sum, a) => sum + a.amount, 0);
        const redeemed = activities.filter(a => a.amount < 0).reduce((sum, a) => sum + a.amount, 0);
        
        const summaryContainer = document.querySelector('.avios-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <div class="summary-item">
                    <span>Earned this month</span>
                    <strong class="positive">+${earned.toLocaleString()}</strong>
                </div>
                <div class="summary-item">
                    <span>Redeemed this month</span>
                    <strong class="negative">${redeemed.toLocaleString()}</strong>
                </div>
                <div class="summary-item total">
                    <span>Total Balance</span>
                    <strong>${this.user.avios.toLocaleString()}</strong>
                </div>
            `;
        }
    }

    // Add event listeners
    addEventListeners() {
        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Check-in buttons
        const checkinButtons = document.querySelectorAll('.btn-primary:has(i.fa-check-in)');
        checkinButtons.forEach(button => {
            button.addEventListener('click', () => {
                alert(`Check-in initiated for ${this.user.firstName}`);
            });
        });
    }

    // Logout function
    logout() {
        // Call backend logout if needed
        fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        }).finally(() => {
            // Clear local storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboardUser = new DashboardUser();
    dashboardUser.init();
});