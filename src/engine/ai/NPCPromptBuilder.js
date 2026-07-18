class NPCPromptBuilder {
    _translateTrust(trust) {
        if (trust > 80) return "Sangat ramah, bersahabat, dan sangat percaya";
        if (trust > 60) return "Ramah dan cukup percaya";
        if (trust > 40) return "Netral, sopan tapi menjaga jarak";
        if (trust > 20) return "Curiga dan waspada";
        return "Sangat bermusuhan dan defensif";
    }

    _translateMemory(health) {
        if (health > 80) return "Sangat jernih dan tajam";
        if (health > 50) return "Normal";
        if (health > 20) return "Agak linglung dan pelupa";
        return "Sangat pikun dan kebingungan";
    }

    build(context) {
        const { npc, player, intent } = context;
        
        const trustDesc = this._translateTrust(npc.trust);
        const memDesc = this._translateMemory(npc.memory_health);

        let prompt = `Konteks Karakter Saat Ini:\n`;
        prompt += `- Nama: ${npc.name}\n`;
        prompt += `- Sikap terhadap pemain: ${trustDesc}\n`;
        prompt += `- Kondisi pikiran: ${memDesc}\n`;
        prompt += `- Mood saat ini: ${npc.mood}\n`;
        prompt += `- Sedang sibuk melakukan: ${npc.activity}\n\n`;

        // Inject Beliefs (Hanya yang dipercaya kuat, certainty = HIGH atau score > 70)
        if (npc.beliefs && npc.beliefs.length > 0) {
            const strongBeliefs = npc.beliefs.filter(b => b.beliefScore > 70);
            if (strongBeliefs.length > 0) {
                prompt += `Rumor yang diyakini kebenarannya oleh ${npc.name}:\n`;
                // Untuk mencegah mahatahu, ambil 2 teratas saja
                strongBeliefs.slice(0, 2).forEach(b => {
                    const text = b.rumorText || b.rumorId;
                    prompt += `- "${text}"\n`;
                });
                prompt += `(Jika relevan dengan percakapan, karakter boleh menyinggung rumor ini).\n\n`;
            }
        }

        if (intent === 'talk') {
            prompt += `Pemain (${player || 'Seseorang'}) mencoba berbicara dengan ${npc.name}. Buatlah narasi dan dialog aksi ${npc.name} yang natural.`;
        } else if (intent === 'help') {
            prompt += `Pemain (${player || 'Seseorang'}) baru saja membantu ${npc.name}. Buatlah narasi respons atau ucapan ${npc.name}.`;
        } else {
            prompt += `Pemain (${player || 'Seseorang'}) melakukan aksi: ${intent}. Buat narasi atas respons ${npc.name}.`;
        }

        return prompt;
    }
}

module.exports = NPCPromptBuilder;
