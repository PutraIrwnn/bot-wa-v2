const IUnitOfWork = require('./IUnitOfWork');
const Logger = require('../engine/core/Logger');

class MySqlUnitOfWork extends IUnitOfWork {
    constructor(dbPool) {
        super();
        this.dbPool = dbPool;
        this.connection = null;
        this.logger = new Logger('MySqlUoW');
    }

    async start() {
        try {
            this.connection = await this.dbPool.getConnection();
            await this.connection.beginTransaction();
            this.logger.info('Transaction started.');
        } catch (err) {
            this.logger.error('Failed to start transaction', err);
            throw err;
        }
    }

    async commit() {
        if (!this.connection) return;
        try {
            await this.connection.commit();
            this.logger.info('Transaction committed.');
        } catch (err) {
            this.logger.error('Failed to commit transaction', err);
            throw err;
        } finally {
            this.connection.release();
            this.connection = null;
        }
    }

    async rollback() {
        if (!this.connection) return;
        try {
            await this.connection.rollback();
            this.logger.info('Transaction rolled back.');
        } catch (err) {
            this.logger.error('Failed to rollback transaction', err);
        } finally {
            this.connection.release();
            this.connection = null;
        }
    }

    getConnection() {
        return this.connection;
    }
}

module.exports = MySqlUnitOfWork;
