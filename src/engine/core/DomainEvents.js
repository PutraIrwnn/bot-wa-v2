/**
 * Domain Events untuk Aetheria (Living World Engine)
 * Format penamaan menggunakan dot notation (misal: subject.action)
 * agar mudah dikelompokkan dan disaring.
 */
const DomainEvents = {
    // Player Events
    PlayerArrived: 'player.arrived',
    PlayerLeft: 'player.left',
    PlayerHelpedNpc: 'player.helped.npc',

    // NPC Agency Events
    NpcDecidedToMove: 'npc.decidedToMove',
    NpcMoved: 'npc.moved',

    // World Events
    WorldTick: 'world.tick',
    PlayerHurtNpc: 'player.hurtNpc',
    
    // Conversation Events
    ConversationStarted: 'conversation.started',
    ConversationEnded: 'conversation.ended',
    NpcRefusedConversation: 'npc.refusedConversation',

    // Memory & Story Events
    MemoryRecovered: 'memory.recovered',
    MemoryLost: 'memory.lost',
    SecretDiscovered: 'secret.discovered',
    StoryNodeUnlocked: 'story.nodeUnlocked',

    // Rumor & News Events
    RumorCreated: 'rumor.created',
    RumorExpired: 'rumor.expired',
    NewsPublished: 'news.published',

    // Relationship Events
    RelationshipDormant: 'relationship.dormant',
    RelationshipArchived: 'relationship.archived',
    RelationshipReactivated: 'relationship.reactivated',

    // Faction Events (Sprint 12B)
    NpcJoinedFaction: 'faction.npcJoined',
    NpcLeftFaction: 'faction.npcLeft',
    PlayerFactionInteraction: 'faction.playerInteraction',

    // Diplomacy Events (Sprint 13)
    WorldEventOccurred: 'world.eventOccurred',
    FactionAllianceFormed: 'faction.allianceFormed',
    FactionRivalryFormed: 'faction.rivalryFormed',
    FactionNeutralized: 'faction.neutralized',

    // World & Location Events
    DayPassed: 'world.dayPassed',
    LocationClosed: 'location.closed',
    LocationOpened: 'location.opened',
    WorldCollapsed: 'world.collapsed',
    WorldRecovered: 'world.recovered',

    // Fundamental Relationship Events
    OutcomeVerified: 'outcome.verified',
    PromiseFulfilled: 'promise.fulfilled',
    PromiseBroken: 'promise.broken',
    LifeSaved: 'life.saved',
    BetrayalDetected: 'betrayal.detected',
    SharedSecret: 'secret.shared',
    TrustChanged: 'trust.changed',
    GiftAccepted: 'gift.accepted',
    GiftRejected: 'gift.rejected'
};

module.exports = DomainEvents;
