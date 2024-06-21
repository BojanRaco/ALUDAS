document.addEventListener('DOMContentLoaded', function() {
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
