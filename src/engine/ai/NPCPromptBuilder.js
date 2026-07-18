class NPCPromptBuilder {
    build(context) {
        const { npc, player, intent } = context;
        
        let prompt = `Konteks Saat Ini:\n`;
        prompt += `- NPC: ${npc.name}\n`;
        prompt += `- NPC Trust terhadap Player: ${npc.trust} (skala 0-100)\n`;
        prompt += `- NPC Memory Health: ${npc.memory_health} (skala 0-100)\n`;
        prompt += `- NPC Mood: ${npc.mood}\n`;
        prompt += `- NPC Activity: ${npc.activity}\n\n`;

        if (intent === 'talk') {
            prompt += `Pemain (${player || 'Seseorang'}) mencoba berbicara dengan ${npc.name}. Buatlah narasi dan dialog singkat balasan ${npc.name} yang mencerminkan mood, trust, dan kondisinya saat ini.`;
        } else if (intent === 'help') {
            prompt += `Pemain (${player || 'Seseorang'}) baru saja membantu ${npc.name}. Buatlah narasi ucapan terima kasih atau respons ${npc.name}.`;
        } else {
            prompt += `Pemain (${player || 'Seseorang'}) melakukan aksi: ${intent}. Buat narasi atas respons ${npc.name}.`;
        }

        return prompt;
    }
}

module.exports = NPCPromptBuilder;
