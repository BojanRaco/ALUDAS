document.addEventListener('DOMContentLoaded', function() {
    fetch('images.json')
        .then(response => response.json())
        .then(data => {
            const slideshowImages = data.index_slider; // Uzimanje slika
            const slideshowContainer = document.querySelector('.slider-wrapper');
            if (slideshowContainer) {
                slideshowImages.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.src.replace(/\\/g, '/'); // Zamena dvostrukih kosa crta
                    imgElement.alt = image.alt;
                    imgElement.loading = "lazy";
                    imgElement.classList.add('slider-item', 'mySlides');
                    slideshowContainer.appendChild(imgElement);
                });
                initializeSlider();
            } else {
                console.error('Slider wrapper not found');
            }
        })
        .catch(error => console.error('Error loading images:', error));
});

function initializeSlider() {
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        const slides = document.getElementsByClassName("mySlides");
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}    
        slides[slideIndex - 1].style.display = "block";  
        setTimeout(showSlides, 5000); // Promeni sliku svakih 5 sekundi
    }
}
