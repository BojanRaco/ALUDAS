document.addEventListener('DOMContentLoaded', function() {
    // Dinamičko učitavanje slika iz images.json fajla za contact stranu
    fetch('images.json')
        .then(response => response.json())
        .then(data => {
            const contactImages = data.contact_images;
            const galleryWrapper = document.querySelector('.contact-gallery-wrapper');
            if (galleryWrapper) {
                contactImages.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.src;
                    imgElement.alt = image.alt;
                    imgElement.loading = "lazy";
                    imgElement.classList.add('contact-gallery-item');
                    imgElement.style.width = "100%";
                    imgElement.style.height = "auto";
                    galleryWrapper.appendChild(imgElement);
                });
            }
        })
        .catch(error => console.error('Error loading images:', error));

    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Sprečava standardno slanje forme
        if (validateForm()) {
            submitForm();
        } else {
            alert("Molimo popunite sva potrebna polja.");
        }
    });
});

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    return name !== "" && email !== "" && message !== "";
}

function submitForm() {
    const formData = new FormData(document.getElementById('contactForm'));
    
    fetch('submit_form.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage("Vaša poruka je uspešno poslata. Hvala što nas kontaktirate!");
        } else {
            showErrorMessage("Došlo je do greške. Molimo pokušajte ponovo.");
        }
    })
    .catch(error => {
        showErrorMessage("Došlo je do greške prilikom slanja poruke.");
    });
}

function showSuccessMessage(message) {
    const messageDiv = document.getElementById('messageStatus');
    messageDiv.textContent = message;
    messageDiv.style.color = 'green';
}

function showErrorMessage(message) {
    const messageDiv = document.getElementById('messageStatus');
    messageDiv.textContent = message;
    messageDiv.style.color = 'red';
}
