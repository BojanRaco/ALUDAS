document.addEventListener("DOMContentLoaded", function() {
    // Funkcija za dinamičko isticanje aktivnog linka u navigaciji
    highlightActiveLink();

    // Glatko skrolanje
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Poruka dobrodošlice koja nestaje
    showWelcomeMessage();

    // Dodaj novu funkcionalnost za video
    var video = document.querySelector(".process-video video");

    video.addEventListener('ended', function() {
        video.currentTime = 0; // Vraća video na početak
        video.play(); // Pokreće video ponovo
    });
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
