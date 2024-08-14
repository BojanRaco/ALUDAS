document.addEventListener('DOMContentLoaded', function() {
    // Dinamičko učitavanje slika iz images.json fajla za about stranu
    fetch('images.json')
        .then(response => response.json())
        .then(data => {
            const aboutImages = data.about_images;
            const galleryWrapper = document.querySelector('.about-gallery-wrapper');
            if (galleryWrapper) {
                aboutImages.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.src;
                    imgElement.alt = image.alt;
                    imgElement.loading = "lazy";
                    imgElement.classList.add('about-gallery-item');
                    imgElement.style.width = "100%";
                    imgElement.style.height = "auto";
                    galleryWrapper.appendChild(imgElement);
                });
            }
        })
        .catch(error => console.error('Error loading images:', error));

    window.addEventListener('scroll', revealElements);
    revealElements(); // Poziva se na učitavanje da obradi već vidljive elemente
});

function revealElements() {
    const reveals = document.querySelectorAll('.reveal');

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150; // Pikseli potrebni da se element "otkrije"

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        } else {
            reveals[i].classList.remove('active');
        }
    }
}
