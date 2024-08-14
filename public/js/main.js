document.addEventListener("DOMContentLoaded", function() {
    highlightActiveLink();
    setupSmoothScrolling();
    showWelcomeMessage();
    loadIndexImages();
    initializeHeroContent();
    setupVideoAutoPlay();
    setupLoginForm(); // Dodaj ovu liniju
});

function highlightActiveLink() {
    const links = document.querySelectorAll('nav ul li a');
    const currentPath = window.location.pathname.split('/').pop();

    links.forEach(link => {
        if (link.href.includes(currentPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function showWelcomeMessage() {
    const message = document.createElement('div');
    message.textContent = "Dobrodošli na sajt Aludas!";
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.right = '20px';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.display = 'none';
    }, 5000);
}

function loadIndexImages() {
    fetch(`images.json?timestamp=${new Date().getTime()}`)
        .then(response => response.json())
        .then(data => {
            const indexImages = data.index_images;
            const sliderWrapper = document.querySelector('.slider-wrapper');
            if (sliderWrapper) {
                indexImages.forEach(image => {
                    const imgElement = document.createElement('img');
                    imgElement.src = image.src;
                    imgElement.alt = image.alt;
                    imgElement.loading = "lazy";
                    imgElement.classList.add('slider-item');
                    imgElement.style.width = "100%";
                    imgElement.style.height = "auto";
                    sliderWrapper.appendChild(imgElement);
                });
                initializeSlider();
            }
        })
        .catch(error => console.error('Error loading images:', error));
}

function initializeSlider() {
    let slideIndex = 0;
    const slides = document.getElementsByClassName("slider-item");

    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}
        slides[slideIndex - 1].style.display = "block";  
        setTimeout(showSlides, 5000); // Promeni sliku svakih 5 sekundi
    }

    showSlides();
}

function initializeHeroContent() {
    const heroContent = document.querySelector('.hero-content');

    setInterval(() => {
        heroContent.style.display = 'block';
        setTimeout(() => {
            heroContent.style.display = 'none';
        }, 3000); // Nestaje nakon 3 sekunde
    }, 6000); // Pojavljuje se nakon svakih 6 sekundi
}

function setupVideoAutoPlay() {
    const video = document.querySelector(".process-video video");
    let videoPlayedOnce = false;

    function checkVideoVisibility() {
        const rect = video.getBoundingClientRect();
        if (!videoPlayedOnce && rect.top >= 0 && rect.bottom <= window.innerHeight) {
            video.play();
            videoPlayedOnce = true;
        }
    }

    window.addEventListener('scroll', checkVideoVisibility);
    window.addEventListener('resize', checkVideoVisibility);
    checkVideoVisibility();

    video.addEventListener('ended', function() {
        showNewHeroContent(); // Prikazuje novi hero content
    });
}

function showNewHeroContent() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.innerHTML = `
            <h1>Pogledajte našu ponudu</h1>
            <button onclick="location.href='products.html'">Saznajte više</button>
        `;
        heroContent.classList.add('over-video');
        heroContent.style.display = 'flex';
    }
}

function setupLoginForm() {
    const logo = document.getElementById('logo');
    const loginForm = document.getElementById('loginForm');
    const closeForm = document.getElementById('closeForm');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');

    logo.addEventListener('dblclick', () => {
        loginForm.style.display = loginForm.style.display === 'none' ? 'flex' : 'none';
    });

    closeForm.addEventListener('click', () => {
        loginForm.style.display = 'none';
    });

    loginButton.addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username.trim() === '' || password.trim() === '') {
            loginError.style.display = 'block';
        } else {
            loginError.style.display = 'none';
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/admin.html';
                } else {
                    alert('Neuspešna prijava. Pokušajte ponovo.');
                }
            })
            .catch(error => console.error('Greška prilikom prijave:', error));
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    highlightActiveLink();
    setupSmoothScrolling();
    showWelcomeMessage();
    loadIndexImages();
    initializeHeroContent();
    setupVideoAutoPlay();
    setupLoginForm(); 
    loadBackgroundImages(); // Dodaj ovu liniju za dinamičko učitavanje pozadinskih slika
});

function loadBackgroundImages() {
    fetch('images.json')
        .then(response => response.json())
        .then(data => {
            // Učitaj pozadinsku sliku za about sekciju
            if (data.about_images && data.about_images.length > 0) {
                document.querySelector('#about').style.backgroundImage = `url('${data.about_images[0].src}')`;
            }

            // Učitaj pozadinsku sliku za contact sekciju
            if (data.contact_images && data.contact_images.length > 0) {
                document.querySelector('body.contact-page').style.backgroundImage = `url('${data.contact_images[0].src}')`;
            }
        })
        .catch(error => console.error('Error loading background images:', error));
}
