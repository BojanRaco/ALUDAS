const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Direktorijumi sa slikama
const directories = {
    about_images: 'docs/images/about_images',
    contact_images: 'docs/images/contact_images',
    index_pictures: 'docs/images/index_pictures',
    index_slider: 'docs/images/index_slider',
    product_images: {
        izlozi_terase: 'docs/images/product_images/izlozi_terase',
        ostalo: 'docs/images/product_images/ostalo',
        prozori: 'docs/images/product_images/prozori',
        vrata: 'docs/images/product_images/vrata'
    }
};

// Direktorijum za kompresovane slike
const outputDir = 'docs/images/compressed_images';

// Osiguraj se da output direktorijum postoji
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Funkcija za pražnjenje direktorijuma
const emptyDirectory = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            fs.unlinkSync(path.join(dirPath, file));
        }
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
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath);

            console.log(`Processing directory: ${categoryPath} - Found ${files.length} files`);

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
                    .rotate()
                    .webp({ quality: 80 })
                    .toFile(outputFilePath);

                outputArray.push({
                    src: outputFilePath.replace(/\\/g, '/').replace('docs/', ''), // Zamenite backslash sa forward slash
                    alt: file
                });

                console.log(`Processed file: ${file}`);
            }
        } else {
            console.warn(`Directory ${categoryPath} does not exist.`);
        }
    };

    // Obrada slika za svaki direktorijum
    for (const category in directories) {
        if (category === 'product_images') {
            for (const subcategory in directories.product_images) {
                const categoryPath = directories.product_images[subcategory];
                await processDirectory(`${category}_${subcategory}`, categoryPath, imagesData.product_images[subcategory]);
            }
        } else {
            const categoryPath = directories[category];
            await processDirectory(category, categoryPath, imagesData[category]);
        }
    }

    // Smeštanje JSON fajla u docs direktorijum
    fs.writeFileSync(path.join('docs', 'images.json'), JSON.stringify(imagesData, null, 2));
    console.log('images.json has been generated and images have been processed and compressed');
};

// Pokreni generisanje JSON fajla
generateImagesJson().catch(console.error);

module.exports = { generateImagesJson };
