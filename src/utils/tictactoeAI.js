/**
 * Tic-Tac-Toe AI Engine
 * =====================
 * Smart but beatable AI for Tic-Tac-Toe.
 */

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom
    [0, 4, 8], [2, 4, 6]             // Diagonal
];

/**
 * Mendapatkan langkah terbaik untuk Bot (O).
 * @param {string[]} board - Papan permainan (array of 9)
 * @param {string} botMarker - 'X' atau 'O' (default 'O')
 * @param {string} playerMarker - 'X' atau 'O' (default 'X')
 * @returns {number} Index (0-8) posisi yang dipilih bot
 */
function getBestMove(board, botMarker = 'O', playerMarker = 'X') {
    const availableSpots = board.map((val, idx) => (val !== 'X' && val !== 'O' ? idx : null)).filter(val => val !== null);
    
    if (availableSpots.length === 0) return -1;

    // 1. Cek apakah Bot bisa MENANG di langkah ini
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] === botMarker && board[b] === botMarker && availableSpots.includes(c)) return c;
        if (board[a] === botMarker && board[c] === botMarker && availableSpots.includes(b)) return b;
        if (board[b] === botMarker && board[c] === botMarker && availableSpots.includes(a)) return a;
    }

    // 2. Cek apakah Player akan MENANG di langkah berikutnya (Blokir!)
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] === playerMarker && board[b] === playerMarker && availableSpots.includes(c)) return c;
        if (board[a] === playerMarker && board[c] === playerMarker && availableSpots.includes(b)) return b;
        if (board[b] === playerMarker && board[c] === playerMarker && availableSpots.includes(a)) return a;
    }

    // Sengaja buat bot sedikit bodoh (20% kemungkinan acak) agar user bisa menang
    if (Math.random() > 0.8) {
        return availableSpots[Math.floor(Math.random() * availableSpots.length)];
    }

    // 3. Ambil posisi Tengah jika kosong
    if (availableSpots.includes(4)) return 4;

    // 4. Ambil Pojok jika kosong
    const corners = [0, 2, 6, 8].filter(idx => availableSpots.includes(idx));
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    // 5. Ambil Sisi lainnya (Edge)
    const edges = [1, 3, 5, 7].filter(idx => availableSpots.includes(idx));
    if (edges.length > 0) return edges[Math.floor(Math.random() * edges.length)];

    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
}

/**
 * Cek status pemenang
 * @returns {'X' | 'O' | 'DRAW' | null}
 */
function checkWinner(board) {
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] === board[b] && board[b] === board[c]) {
            return board[a]; // Mengembalikan 'X' atau 'O'
        }
    }

    // Cek apakah papan penuh (Draw)
    const isFull = board.every(val => val === 'X' || val === 'O');
    if (isFull) return 'DRAW';

    return null; // Belum ada yang menang
}

/**
 * Render papan ke format string Emoji
 */
function renderBoard(board) {
    const emojis = {
        '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
        '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
        '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
        'X': '❌', 'O': '⭕'
    };

    const b = board.map(val => emojis[val] || val);

    return `
${b[0]} | ${b[1]} | ${b[2]}
➖➖➖➖➖➖
${b[3]} | ${b[4]} | ${b[5]}
➖➖➖➖➖➖
${b[6]} | ${b[7]} | ${b[8]}
    `.trim();
}

module.exports = { getBestMove, checkWinner, renderBoard };
