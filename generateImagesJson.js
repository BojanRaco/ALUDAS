const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const express = require('express');
const multer = require('multer');

// Direktorijumi sa slikama
const directories = {
    about_images: 'images/about_images',
    contact_images: 'images/contact_images',
    index_pictures: 'images/index_pictures',
    index_slider: 'images/index_slider',
    product_images: {
        izlozi_terase: 'images/product_images/izlozi_terase',
        ostalo: 'images/product_images/ostalo',
        prozori: 'images/product_images/prozori',
        vrata: 'images/product_images/vrata'
    }
};

// Direktorijum za konvertovane slike
const outputDir = 'images/compressed_images';

// Osiguraj se da output direktorijum postoji
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Funkcija za pražnjenje direktorijuma
const emptyDirectory = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        fs.unlinkSync(path.join(dirPath, file));
    }
};

// Funkcija za generisanje informacija o slikama
const generateImagesJson = async () => {
    let imagesData = {
        about_images: [],
        contact_images: [],
        index_pictures: [],
        index_slider: [],
        product_images: {
            izlozi_terase: [],
            ostalo: [],
            prozori: [],
            vrata: []
        }
    };

    // Isprazni direktorijum pre generisanja novih slika
    emptyDirectory(outputDir);

    // Funkcija za obradu slika u direktorijumu
    const processDirectory = async (category, categoryPath, outputArray) => {
        const files = fs.readdirSync(categoryPath);

        for (const file of files) {
            const inputFilePath = path.join(categoryPath, file);
            const outputFilePath = path.join(outputDir, `${category}_${file}.webp`);

            await sharp(inputFilePath)
                .resize({
                    width: 1200,
                    height: 600,
                    fit: sharp.fit.contain,
                    background: { r: 60, g: 60, b: 60, alpha: 1 }
                })
                .rotate() // Zadrži originalnu orijentaciju
                .webp({ quality: 80 })
                .toFile(outputFilePath);

            outputArray.push({
                src: outputFilePath.replace(/\\/g, '/'),
                alt: `${category} ${file}`
            });
        }
    };

    // Obrada slika za svaki direktorijum
    for (const category in directories) {
        if (category === 'product_images') {
            for (const subcategory in directories.product_images) {
                const categoryPath = directories.product_images[subcategory];
                await processDirectory(subcategory, categoryPath, imagesData.product_images[subcategory]);
            }
        } else {
            const categoryPath = directories[category];
            await processDirectory(category, categoryPath, imagesData[category]);
        }
    }

    fs.writeFileSync('images.json', JSON.stringify(imagesData, null, 2));
    console.log('images.json has been generated and images have been processed and compressed');
};

// Pokreni generisanje JSON fajla
generateImagesJson().catch(console.error);

// Konfiguracija za express i multer
const app = express();
const port = 3000;

app.use(express.json()); // Podrška za JSON zahteve

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const section = req.body.section;
        const uploadPath = path.join(__dirname, 'images', section);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Posluživanje statičkih fajlova
app.use(express.static(path.join(__dirname)));

// Ruta za upload slike
app.post('/upload_image', upload.single('image'), (req, res) => {
    const section = req.body.section;
    const image = req.file;

    if (!image) {
        return res.status(400).json({ message: 'Nema uploadovane slike.' });
    }

    const inputFilePath = image.path;
    const outputFilePath = path.join(__dirname, 'images', 'compressed_images', `${section}_${image.filename}.webp`);

    sharp(inputFilePath)
        .resize({
            width: 1200,
            height: 600,
            fit: sharp.fit.contain,
            background: { r: 60, g: 60, b: 60, alpha: 1 }
        })
        .rotate()
        .webp({ quality: 80 })
        .toFile(outputFilePath)
        .then(() => {
            res.json({ message: 'Slika uspešno uploadovana!' });

            // Ponovno generisanje JSON fajla nakon upload-a
            generateImagesJson().catch(console.error);
        })
        .catch(error => {
            console.error('Greška:', error);
            res.status(500).json({ message: 'Greška pri obradi slike.' });
        });
});

// Ruta za brisanje slike
app.post('/delete_image', (req, res) => {
    const section = req.body.section;
    const imageName = req.body.imageName;

    const imagePath = path.join(__dirname, 'images', section, imageName);
    const compressedImagePath = path.join(__dirname, 'images', 'compressed_images', `${section}_${imageName}.webp`);

    console.log(`Trying to delete image: ${imagePath}`);

    if (!fs.existsSync(imagePath)) {
        console.log('Image not found in original directory');
        return res.status(404).json({ message: 'Slika nije pronađena.' });
    }

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Greška pri brisanju slike iz originalnog direktorijuma:', err);
            return res.status(500).json({ message: 'Greška pri brisanju slike.' });
        }

        console.log('Image deleted from original directory successfully');

        // Uklanjanje komprimovane slike
        if (fs.existsSync(compressedImagePath)) {
            fs.unlink(compressedImagePath, (err) => {
                if (err) {
                    console.error('Greška pri brisanju komprimovane slike:', err);
                    return res.status(500).json({ message: 'Greška pri brisanju komprimovane slike.' });
                }
                console.log('Compressed image deleted successfully');
            });
        }

        // Ponovno generisanje JSON fajla nakon brisanja
        generateImagesJson().catch(console.error);

        res.json({ message: 'Slika uspešno obrisana.' });
    });
});

// Ruta za dobavljanje slika za odabranu sekciju
app.get('/get_images', (req, res) => {
    const section = req.query.section;
    const imagesData = JSON.parse(fs.readFileSync('images.json'));

    // Pronađimo slike za zadatu sekciju
    const findSectionImages = (data, section) => {
        if (section.includes('/')) {
            const [mainSection, subSection] = section.split('/');
            return data[mainSection][subSection] || [];
        }
        return data[section] || [];
    };

    const sectionPath = findSectionImages(imagesData, section);
    res.json({ images: sectionPath });
});

// Ruta za osvežavanje slika
app.get('/refresh_images', (req, res) => {
    generateImagesJson().then(() => {
        res.json({ message: 'Slike su osvežene.' });
    }).catch(error => {
        res.status(500).json({ message: 'Greška pri osvežavanju slika.' });
    });
});

app.listen(port, () => {
    console.log(`Server pokrenut na http://localhost:${port}`);
});
