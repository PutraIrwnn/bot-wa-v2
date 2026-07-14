/**
 * Tebak Gambar — Question Pool
 * =============================
 * 30 curated questions across 4 categories:
 * - 🐾 Hewan (Animals) — 8 soal
 * - 🏛️ Landmark Dunia — 7 soal
 * - 🍔 Makanan — 8 soal
 * - 📦 Objek / Benda — 7 soal
 * 
 * Each question has:
 * - question: Text shown to players
 * - answer: Array of valid answers (case-insensitive, supports synonyms)
 * - imagePrompt: Prompt for Pollinations AI image generation
 * - hint: A clue revealed halfway through the timer
 * - points: Score awarded for correct answer
 */

module.exports = [
    // ═══════════════════════════════════════
    //  🐾 HEWAN (Animals) — 8 soal
    // ═══════════════════════════════════════
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["kucing", "cat", "kitten"],
        imagePrompt: "a realistic close-up photo of a cute orange tabby cat sitting on a wooden table, soft studio lighting, 4k",
        hint: "Suka tidur dan bilang meow 🐱",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["gajah", "elephant"],
        imagePrompt: "a majestic African elephant walking through savanna grassland at golden hour, wildlife photography, 4k",
        hint: "Hewan darat terbesar di dunia 🐘",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["penguin", "pinguin"],
        imagePrompt: "a group of emperor penguins standing on Antarctic ice, crystal clear photography, National Geographic style, 4k",
        hint: "Burung yang tidak bisa terbang, tinggal di es 🐧",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["lumba-lumba", "lumba lumba", "dolphin", "dolpin"],
        imagePrompt: "a beautiful bottlenose dolphin jumping out of clear blue ocean water, splash photography, 4k",
        hint: "Mamalia laut yang sangat pintar dan suka melompat 🐬",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["panda", "panda bear"],
        imagePrompt: "a cute giant panda eating bamboo in a lush green bamboo forest, National Geographic photo, 4k",
        hint: "Beruang hitam-putih dari Tiongkok 🐼",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["elang", "eagle", "rajawali"],
        imagePrompt: "a bald eagle soaring through cloudy sky with wings spread wide, majestic wildlife photography, 4k",
        hint: "Raja dari semua burung, simbol kekuatan 🦅",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["kura-kura", "kura kura", "turtle", "penyu"],
        imagePrompt: "a large green sea turtle swimming gracefully in crystal clear tropical water, underwater photography, 4k",
        hint: "Lambat tapi pasti, punya cangkang keras 🐢",
        points: 10
    },
    {
        question: "🖼️ Hewan apa yang ada di gambar ini?",
        answer: ["jerapah", "giraffe"],
        imagePrompt: "a tall giraffe standing in African savanna with acacia trees in background, golden hour photography, 4k",
        hint: "Hewan dengan leher paling panjang di dunia 🦒",
        points: 10
    },

    // ═══════════════════════════════════════
    //  🏛️ LANDMARK DUNIA — 7 soal
    // ═══════════════════════════════════════
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["menara eiffel", "eiffel", "eiffel tower"],
        imagePrompt: "the Eiffel Tower in Paris at sunset with orange sky, beautiful cityscape photography, 4k",
        hint: "Menara besi ikonik di kota cinta, Paris 🗼",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["piramida", "pyramid", "piramida giza", "great pyramid"],
        imagePrompt: "the Great Pyramids of Giza in Egypt with a camel in foreground, desert landscape, golden hour, 4k",
        hint: "Bangunan kuno berbentuk segitiga di Mesir 🔺",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["taj mahal", "tajmahal"],
        imagePrompt: "the Taj Mahal in India reflecting in water pool at sunrise, beautiful marble architecture, 4k",
        hint: "Istana marmer putih di India, simbol cinta abadi 🕌",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["colosseum", "koloseum", "coliseum"],
        imagePrompt: "the Roman Colosseum in Rome Italy at golden hour, ancient architecture photography, dramatic sky, 4k",
        hint: "Arena gladiator kuno di Roma, Italia 🏟️",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["liberty", "patung liberty", "statue of liberty"],
        imagePrompt: "the Statue of Liberty in New York with blue sky background, patriotic photography, 4k",
        hint: "Patung wanita raksasa memegang obor di New York 🗽",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["borobudur", "candi borobudur"],
        imagePrompt: "Borobudur Buddhist temple in Java Indonesia at misty sunrise with mountains in background, heritage photography, 4k",
        hint: "Candi Buddha terbesar di dunia, ada di Jawa Tengah 🇮🇩",
        points: 10
    },
    {
        question: "🖼️ Landmark terkenal apa yang ada di gambar ini?",
        answer: ["monas", "monumen nasional", "tugu monas"],
        imagePrompt: "Monas National Monument Jakarta Indonesia at night with golden flame tip illuminated, city landmark photography, 4k",
        hint: "Tugu tinggi berapi emas di pusat ibukota Indonesia 🇮🇩",
        points: 10
    },

    // ═══════════════════════════════════════
    //  🍔 MAKANAN — 8 soal
    // ═══════════════════════════════════════
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["pizza"],
        imagePrompt: "a delicious pepperoni pizza with melted cheese on wooden board, food photography, studio lighting, 4k",
        hint: "Makanan Italia bundar dengan topping keju 🍕",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["sushi"],
        imagePrompt: "a beautiful platter of assorted Japanese sushi with salmon nigiri and maki rolls, food photography, 4k",
        hint: "Makanan Jepang dari nasi dan ikan mentah 🍣",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["nasi goreng", "nasigoreng", "fried rice"],
        imagePrompt: "a plate of Indonesian nasi goreng fried rice with fried egg on top and prawn crackers on the side, food photography, 4k",
        hint: "Makanan favorit Indonesia, nasi yang digoreng 🍳",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["rendang", "beef rendang"],
        imagePrompt: "a plate of authentic Indonesian beef rendang with rich dark brown sauce on banana leaf, Padang food photography, 4k",
        hint: "Masakan Minang yang pernah jadi makanan terenak di dunia 🥩",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["burger", "hamburger"],
        imagePrompt: "a juicy gourmet cheeseburger with lettuce tomato and melted cheese, fast food photography with dark background, 4k",
        hint: "Roti isi daging, keju, dan sayuran dari Amerika 🍔",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["sate", "satay", "sate ayam"],
        imagePrompt: "Indonesian chicken satay skewers grilled over charcoal fire with peanut sauce on the side, street food photography, 4k",
        hint: "Daging tusuk yang dibakar, disajikan dengan bumbu kacang 🥜",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["ramen"],
        imagePrompt: "a steaming bowl of Japanese tonkotsu ramen with chashu pork soft boiled egg and nori, food photography, 4k",
        hint: "Mie kuah khas Jepang yang mengepulkan uap 🍜",
        points: 10
    },
    {
        question: "🖼️ Makanan apa yang ada di gambar ini?",
        answer: ["donat", "donut", "doughnut"],
        imagePrompt: "colorful assorted donuts with various toppings and sprinkles on a marble surface, bakery photography, 4k",
        hint: "Roti bundar berlubang tengah dengan topping manis 🍩",
        points: 10
    },

    // ═══════════════════════════════════════
    //  📦 OBJEK / BENDA — 7 soal
    // ═══════════════════════════════════════
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["gitar", "guitar"],
        imagePrompt: "a beautiful acoustic guitar leaning against a brick wall, warm lighting, music instrument photography, 4k",
        hint: "Alat musik petik berdawai yang sering dimainkan penyanyi 🎸",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["kamera", "camera"],
        imagePrompt: "a vintage film camera on a wooden desk with bokeh background, product photography, warm tones, 4k",
        hint: "Alat untuk mengambil foto dan video 📷",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["sepeda", "bicycle", "bike"],
        imagePrompt: "a red vintage bicycle parked against a colorful flower wall, lifestyle photography, 4k",
        hint: "Kendaraan roda dua yang dikayuh pakai kaki 🚲",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["jam tangan", "arloji", "watch"],
        imagePrompt: "a luxury wristwatch on dark marble surface with dramatic side lighting, product photography, 4k",
        hint: "Aksesori yang dipakai di pergelangan tangan untuk melihat waktu ⌚",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["bola", "ball", "bola sepak", "soccer ball", "football"],
        imagePrompt: "a classic black and white soccer ball on green grass field with stadium in background, sports photography, 4k",
        hint: "Benda bundar yang ditendang 22 orang di lapangan hijau ⚽",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["headphone", "headset", "earphone"],
        imagePrompt: "premium over-ear headphones on a minimalist desk setup, product photography, dark background with blue accent lighting, 4k",
        hint: "Alat yang dipasang di telinga untuk mendengarkan musik 🎧",
        points: 10
    },
    {
        question: "🖼️ Benda apa yang ada di gambar ini?",
        answer: ["buku", "book"],
        imagePrompt: "a stack of old hardcover books with reading glasses on top, cozy library atmosphere, warm lighting, 4k",
        hint: "Berisi halaman-halaman pengetahuan, teman para kutu... 📚",
        points: 10
    }
];
