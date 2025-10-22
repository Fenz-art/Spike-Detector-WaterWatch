/* Contact Page JS */

// Initialize map
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Leaflet map
    if (document.getElementById('map') && typeof L !== 'undefined') {
        const map = L.map('map').setView([40.7128, -74.0060], 13); // New York coordinates
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker
        const marker = L.marker([40.7128, -74.0060]).addTo(map);
        marker.bindPopup('<b>Waterborne Disease Monitor</b><br>123 Health Street<br>New York, NY 10001').openPopup();
    }
    
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.classList.add('d-none');
            btnLoading.classList.remove('d-none');
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
                contactForm.reset();
                
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
            }, 2000);
        });
    }
});
