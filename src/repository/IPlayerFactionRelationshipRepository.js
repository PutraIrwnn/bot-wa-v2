/**
 * IPlayerFactionRelationshipRepository
 */
class IPlayerFactionRelationshipRepository {
    async loadAll(connection = null) {
        throw new Error('Not implemented');
    }

    async saveState(relationship, connection = null) {
        throw new Error('Not implemented');
    }
}

module.exports = IPlayerFactionRelationshipRepository;
