# Aetheria Boot Sequence

Diagram ini memandu urutan eksekusi inisialisasi pada saat aplikasi pertama kali dijalankan. Kompleksitas *startup* membutuhkan *dependency injection* berurutan agar tiap modul mendapat pasokan data dan kelas prasyaratnya dengan benar.

```mermaid
graph TD
    A([Start Application]) --> B(1. Load Environment Config)
    B --> C(2. Instantiate Logger)
    C --> D(3. Establish Database Connection Pool)
    
    D --> E(4. Instantiate Repositories)
    E -->|MySqlNpcRepository| F(5. Initialize EventBus)
    E -->|MySqlWorldRepository| F
    
    F --> G(6. Instantiate Domain Engines)
    G -->|Inject EventBus & Repos| H(7. Trigger Engine Recovery Routine)
    
    H -->|NPCEngine.init| I(Load States from MySQL to RAM)
    H -->|ExploreEngine.init| I
    
    I --> J(8. Instantiate Action Engine)
    J -->|Inject Domain Engines| K(9. Instantiate Command Router)
    
    K --> L(10. Initialize WhatsApp Adapter Baileys)
    L --> M{Is Session Valid?}
    M -->|No| N(Display QR Code in Terminal)
    M -->|Yes| O(Connect to WhatsApp Socket)
    
    N --> O
    O --> P([System Ready to Receive Messages])
```

Jika terjadi _crash_ pada masa *startup*, perhatikan _log error_ untuk menemukan di titik mana *dependency* gagal disuntikkan atau koneksi tertolak.
