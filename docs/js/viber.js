document.addEventListener("DOMContentLoaded", function() {
    const viberLink = document.querySelector('a.viber-link');
    const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.viber.voip'; // Link za Play Store
    
    viberLink.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Pokušaj otvaranja Viber aplikacije
        const viberAppUrl = 'viber://chat?number=%2B381644424971';
        const startTime = Date.now();

        // Kreiraj nevidljivi iframe koji će pokušati da otvori aplikaciju
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = viberAppUrl;

        document.body.appendChild(iframe);

        // Povećan vremenski opseg na 3 sekunde za proveru
        setTimeout(function() {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 3000) { // 3 sekunde umesto 1.5
                window.location.href = fallbackUrl;
            }
        }, 2500); // Vreme čekanja pre provere

        // Ukloni iframe nakon pokušaja
        setTimeout(function() {
            document.body.removeChild(iframe);
        }, 3500);
    });
});
