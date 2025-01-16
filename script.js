const infoIcons = document.querySelectorAll('.fa-info-circle');

infoIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    // 1. Get the package name
    const packageName = icon.closest('.package-card').dataset.package; 

    // 2. You'll need to define the content for each package
    let notIncludedContent = "";
    switch (packageName) {
      case 'basic':
        notIncludedContent = "This package does not include: ...";
        break;
      case 'standard':
        notIncludedContent = "This package does not include: ...";
        break;
      // ... add cases for other packages
      default:
        notIncludedContent = "Information not available for this package.";
    }

    // 3. Show the content in a modal or alert
    alert(notIncludedContent); 
  });
});

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Toggle the navigation menu on hamburger click
hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('show');
});

// Hide the menu when clicking outside
document.addEventListener('click', function (event) {
    if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
        navLinks.classList.remove('show');
    }
});