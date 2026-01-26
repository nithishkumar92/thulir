const apiKey = 'AIzaSyAwVNjzgZ2Q0XdOVPtzNUBYTqfZxfoie6I';
const spreadsheetId = '14xy2C6uXhbwAc_9u2ey8_kEPR2F-tsbLs-FLdZs7THM';
const range = 'English!A1:D46';

let packageData = [];

// Fetch data from Google Sheets
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        const values = data.values;
        packageData = values;
        
        // Populate desktop table
        populateDesktopTable(values);
        
        // Populate mobile cards
        populateMobileCards(values);
    })
    .catch(error => console.error('Error fetching data:', error));

// Populate desktop table view
function populateDesktopTable(values) {
    const table = document.getElementById('packageTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    values.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row as it's already in thead
        
        const tableRow = document.createElement('tr');
        
        row.forEach((cell, cellIndex) => {
            const tableCell = document.createElement('td');

            // Handle merged cells (null values)
            if (cell === null || cell === '') {
                const prevCell = tableRow.cells[cellIndex - 1];
                if (prevCell) {
                    const colspan = parseInt(prevCell.getAttribute('colspan') || '1', 10) + 1;
                    prevCell.setAttribute('colspan', colspan);
                    return;
                }
            }

            // Handle bold text (category headers)
            if (cell && cell.startsWith('<b>') && cell.endsWith('</b>')) {
                tableCell.innerHTML = cell;
                tableCell.style.fontWeight = '700';
                tableCell.style.color = '#a88734';
                tableCell.style.fontSize = '1.05rem';
            } else {
                tableCell.textContent = cell;
            }

            tableRow.appendChild(tableCell);
        });
        
        tbody.appendChild(tableRow);
    });
}

// Populate mobile card view
function populateMobileCards(values) {
    const mobileContainer = document.getElementById('mobilePackages');
    mobileContainer.innerHTML = '';

    // Package configuration
    const packages = [
        { 
            index: 1, 
            name: 'Silver Package', 
            icon: 'fa-medal',
            description: 'Essential features for quality construction'
        },
        { 
            index: 2, 
            name: 'Gold Package', 
            icon: 'fa-trophy',
            description: 'Enhanced features with premium materials'
        },
        { 
            index: 3, 
            name: 'Platinum Package', 
            icon: 'fa-crown',
            description: 'Ultimate luxury with finest materials'
        }
    ];

    packages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'package-card fade-in';
        
        let featuresHTML = '';
        let currentCategory = '';
        
        values.forEach((row, rowIndex) => {
            if (rowIndex === 0) return; // Skip header
            
            const featureName = row[0];
            const featureValue = row[pkg.index];
            
            // Check if it's a category header
            if (featureName && featureName.startsWith('<b>') && featureName.endsWith('</b>')) {
                currentCategory = featureName.replace(/<\/?b>/g, '');
                featuresHTML += `<div class="feature-category">${currentCategory}</div>`;
            } else if (featureName && featureValue) {
                featuresHTML += `
                    <div class="feature-item-mobile">
                        <span class="feature-name">${featureName}</span>
                        <span class="feature-value">${featureValue}</span>
                    </div>
                `;
            }
        });

        card.innerHTML = `
            <div class="package-card-header">
                <div class="package-icon">
                    <i class="fas ${pkg.icon}"></i>
                </div>
                <h3 class="package-name">${pkg.name}</h3>
                <p class="package-description">${pkg.description}</p>
            </div>
            <div class="feature-list">
                ${featuresHTML}
            </div>
        `;
        
        mobileContainer.appendChild(card);
    });
}

// Toggle mobile menu
function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    const hamburger = document.getElementById("hamburger");
    
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");

    // Auto-close after 5 seconds
    if (navLinks.classList.contains("active")) {
        setTimeout(function() {
            navLinks.classList.remove("active");
            hamburger.classList.remove("active");
        }, 5000);
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.package-card, .service-card, .feature-item');
    animatedElements.forEach(el => observer.observe(el));
});
