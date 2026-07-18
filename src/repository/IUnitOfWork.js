/**
 * IUnitOfWork
 * Abstraksi untuk melakukan operasi database majemuk secara atomik (Transaction).
 */
class IUnitOfWork {
    async start() {
        throw new Error("Method not implemented.");
    }

    async commit() {
        throw new Error("Method not implemented.");
    }

    async rollback() {
        throw new Error("Method not implemented.");
    }

    /**
     * Mendapatkan koneksi/transaksi aktif untuk dioperkan ke Repository
     */
    getConnection() {
        throw new Error("Method not implemented.");
    }
}

module.exports = IUnitOfWork;
