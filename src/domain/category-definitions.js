export const CATEGORY_DEFINITIONS = [
    {
        key: 'manufacturers',
        label: 'Manufacturers',
        singular: 'Manufacturer',
        fileName: 'manufacturers.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'logo_url', 'light', 'dark', 'quote'],
        requiredFields: ['id', 'name', 'logo_url', 'light', 'dark', 'quote'],
        defaults: {
            id: 'HRS',
            name: 'HORUS CELL',
            logo_url: '',
            light: '#7df9ff',
            dark: '#0a1d1f',
            quote: 'Open the sealed circuit. Free the loop.'
        }
    },
    {
        key: 'actions',
        label: 'Actions',
        singular: 'Action',
        fileName: 'actions.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'detail', 'activation', 'mech', 'pilot'],
        requiredFields: ['id', 'name', 'detail', 'activation'],
        defaults: {
            id: 'act_example',
            name: 'Example Action',
            detail: 'Describe what this action does.',
            activation: 'Quick',
            mech: true
        }
    },
    {
        key: 'backgrounds',
        label: 'Backgrounds',
        singular: 'Background',
        fileName: 'backgrounds.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description', 'skills'],
        requiredFields: ['id', 'name', 'description'],
        defaults: {
            id: 'bg_example',
            name: 'Signal Diver',
            description: 'You learned to navigate encrypted Omninet ruins.',
            skills: []
        }
    },
    {
        key: 'core_bonuses',
        label: 'Core Bonuses',
        singular: 'Core Bonus',
        fileName: 'core_bonuses.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'source', 'effect', 'description'],
        requiredFields: ['id', 'name', 'source', 'effect', 'description'],
        defaults: {
            id: 'cb_example',
            name: 'Lesson of Open Threads',
            source: 'HRS',
            effect: 'Gain +1 Accuracy on tech attacks.',
            description: 'A half-remembered theorem haunts your targeting heuristics.'
        }
    },
    {
        key: 'environments',
        label: 'Environments',
        singular: 'Environment',
        fileName: 'environments.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description'],
        requiredFields: ['id', 'name', 'description'],
        defaults: {
            id: 'env_example',
            name: 'Shattered Data Shrine',
            description: 'A battlefield layered with fragmented signal ghosts.'
        }
    },
    {
        key: 'frames',
        label: 'Frames',
        singular: 'Frame',
        fileName: 'frames.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'source', 'license_id', 'license_level', 'mounts', 'description', 'stats', 'traits', 'core_system'],
        requiredFields: ['id', 'name', 'source', 'license_id', 'license_level', 'mounts', 'description', 'stats', 'traits', 'core_system'],
        defaults: {
            id: 'mf_example_frame',
            name: 'NULL-SHARD',
            source: 'HRS',
            license_id: 'mf_example_frame',
            license_level: 2,
            mounts: ['Main', 'Flex'],
            mechtype: ['Controller'],
            specialty: false,
            description: 'A pattern-group frame that weaponizes observational uncertainty.',
            stats: {
                size: 1,
                structure: 4,
                stress: 4,
                armor: 0,
                hp: 8,
                evasion: 8,
                edef: 10,
                heatcap: 6,
                repcap: 4,
                sensor_range: 10,
                tech_attack: 1,
                save: 10,
                speed: 4,
                sp: 6
            },
            traits: [
                {
                    name: 'Paracausal Echo',
                    description: 'When you Lock On, gain 1 Overshield.'
                }
            ],
            core_system: {
                name: 'BLACKBOX MAZE',
                active_name: 'Disjunction Bloom',
                active_effect: 'Until end of scene, your tech attacks gain +1 Accuracy.',
                activation: 'Protocol'
            }
        }
    },
    {
        key: 'mods',
        label: 'Mods',
        singular: 'Mod',
        fileName: 'mods.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'source', 'license_id', 'license_level', 'effect', 'description'],
        requiredFields: ['id', 'name', 'source', 'license_id', 'license_level'],
        defaults: {
            id: 'wm_example_mod',
            name: 'Quantum Lattice Sleeve',
            source: 'HRS',
            license_id: 'mf_example_frame',
            license_level: 1,
            effect: 'Weapon gains +1 Range.',
            description: 'A probabilistic sheath that bends shot vectors by a few impossible degrees.'
        }
    },
    {
        key: 'pilot_gear',
        label: 'Pilot Gear',
        singular: 'Pilot Item',
        fileName: 'pilot_gear.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'type', 'description', 'effect'],
        requiredFields: ['id', 'name', 'type'],
        defaults: {
            id: 'pg_example',
            name: 'Phase Knife',
            type: 'Weapon',
            description: 'A blade with half a hitbox in local reality.',
            effect: 'Gain +1 Accuracy on first melee attack each scene.'
        }
    },
    {
        key: 'reserves',
        label: 'Reserves',
        singular: 'Reserve',
        fileName: 'reserves.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'type', 'label', 'description', 'consumable'],
        requiredFields: ['id', 'name', 'type', 'label'],
        defaults: {
            id: 'res_example',
            name: 'Spoofed IFF Burst',
            type: 'Tactical',
            label: 'TACTICAL',
            description: 'Once, force an enemy to reroll a targeting check.',
            consumable: true
        }
    },
    {
        key: 'sitreps',
        label: 'Sitreps',
        singular: 'Sitrep',
        fileName: 'sitreps.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description', 'objective', 'deployment'],
        requiredFields: ['id', 'name', 'description'],
        defaults: {
            id: 'sit_example',
            name: 'Ghost Relay',
            description: 'Both sides race to recover fragmented relay keys.',
            objective: 'Control relay nodes at end of round 6.',
            deployment: 'Standard deployment.'
        }
    },
    {
        key: 'skills',
        label: 'Skill Triggers',
        singular: 'Skill Trigger',
        fileName: 'skills.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description', 'detail', 'family'],
        requiredFields: ['id', 'name', 'description', 'detail', 'family'],
        defaults: {
            id: 'sk_example',
            name: 'Hack or Breach',
            description: 'Rapid exploit and intrusion work.',
            detail: 'Use when bypassing hardened digital systems under pressure.',
            family: 'int'
        }
    },
    {
        key: 'statuses',
        label: 'Statuses and Conditions',
        singular: 'Status/Condition',
        fileName: 'statuses.json',
        kind: 'array',
        beginnerFields: ['name', 'type', 'effects', 'icon_url', 'terse', 'exclusive'],
        requiredFields: ['name', 'type', 'effects', 'icon_url'],
        defaults: {
            name: 'JAMMED THREADS',
            type: 'Status',
            effects: 'This character cannot make tech attacks.',
            icon_url: ''
        }
    },
    {
        key: 'systems',
        label: 'Systems',
        singular: 'System',
        fileName: 'systems.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'source', 'license_id', 'license_level', 'type', 'sp', 'description', 'effect'],
        requiredFields: ['id', 'name', 'source', 'license_id', 'license_level'],
        defaults: {
            id: 'ms_example_system',
            name: 'Signal Fork Array',
            source: 'HRS',
            license_id: 'mf_example_frame',
            license_level: 1,
            type: 'Tech',
            sp: 2,
            description: 'A distributed packet harvester threaded through your reactor telemetry.',
            effect: '1/round, when you hit with a tech attack, gain 1 Heat.'
        }
    },
    {
        key: 'tables',
        label: 'Tables',
        singular: 'Tables',
        fileName: 'tables.json',
        kind: 'object',
        beginnerFields: ['pilot_names', 'pilot_callsigns', 'mech_names', 'quirks'],
        requiredFields: [],
        defaults: {
            pilot_names: [],
            pilot_callsigns: [],
            mech_names: [],
            quirks: []
        }
    },
    {
        key: 'tags',
        label: 'Tags',
        singular: 'Tag',
        fileName: 'tags.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description', 'hidden', 'filter_ignore'],
        requiredFields: ['id', 'name', 'description'],
        defaults: {
            id: 'tg_example',
            name: 'Threaded',
            description: 'This item can chain effects across linked targets.'
        }
    },
    {
        key: 'talents',
        label: 'Talents',
        singular: 'Talent',
        fileName: 'talents.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'description', 'ranks', 'icon_url', 'terse'],
        requiredFields: ['id', 'name', 'description', 'ranks'],
        defaults: {
            id: 'tal_example',
            name: 'Threadwalker',
            description: 'You move through hostile signal-space as if it were home.',
            ranks: [
                {
                    name: 'Rank I',
                    description: 'Gain +1 Accuracy on first tech attack each round.'
                },
                {
                    name: 'Rank II',
                    description: '1/round when you invade, clear 1 heat.'
                },
                {
                    name: 'Rank III',
                    description: 'When you crit with a tech attack, choose another target in Sensors to lock on.'
                }
            ]
        }
    },
    {
        key: 'weapons',
        label: 'Weapons',
        singular: 'Weapon',
        fileName: 'weapons.json',
        kind: 'array',
        beginnerFields: ['id', 'name', 'source', 'license_id', 'license_level', 'mount', 'type', 'description', 'damage', 'range'],
        requiredFields: ['id', 'name', 'source', 'license_id', 'license_level', 'mount', 'type', 'description'],
        defaults: {
            id: 'mw_example_weapon',
            name: 'Cipher Lance',
            source: 'HRS',
            license_id: 'mf_example_frame',
            license_level: 1,
            mount: 'Main',
            type: 'Nexus',
            description: 'A packetized filament weapon that spikes target telemetry.',
            damage: [{ type: 'energy', val: '1d6+1' }],
            range: [{ type: 'Range', val: 10 }]
        }
    }
];

export const FIELD_TOOLTIPS = {
    id: 'Unique ID used for references. Keep it stable after release.',
    name: 'Display name shown in COMP/CON.',
    description: 'Rules or flavor text. Plain text is fine, HTML is also accepted.',
    detail: 'Expanded action/trigger details shown in UI.',
    activation: 'Action timing, for example Quick, Full, Protocol, Reaction.',
    source: 'Manufacturer ID that this content belongs to.',
    license_id: 'Frame ID this equipment is tied to for license progression.',
    license_level: 'Unlock level within the associated license.',
    mounts: 'Array of mount slots for a frame.',
    stats: 'Core frame stats object.',
    core_system: 'Frame core power definition.',
    traits: 'Frame trait list.',
    type: 'Category-specific enum, such as Weapon/System/Status type.',
    sp: 'System Points cost when equipped.',
    effect: 'Mechanical effect text.',
    mount: 'Weapon mount size.',
    range: 'Range bands array. Example: [{ type: "Range", val: 10 }].',
    damage: 'Damage entries array. Example: [{ type: "kinetic", val: "1d6" }].',
    family: 'Skill family: str, con, dex, int, cha.',
    quote: 'Manufacturer flavor quote.',
    light: 'Hex color for light-base themes.',
    dark: 'Hex color for dark-base themes.',
    website: 'Optional URL shown in content manager.',
    dependencies: 'Required external LCP packs with semver versions.',
    item_prefix: 'Optional prefix to keep IDs distinct.',
    icon_url: 'Icon image URL.',
    logo_url: 'Manufacturer logo image URL.',
    hidden: 'Hide tag from standard rendering/filter lists.',
    filter_ignore: 'Exclude tag from filter UI.',
    pilot_names: 'Rollable table names for pilot creation.',
    pilot_callsigns: 'Rollable callsigns table.',
    mech_names: 'Rollable mech names table.',
    quirks: 'Rollable quirk table.',
    ranks: 'Talent rank data list.',
    terse: 'Short UI text where compact wording helps.',
    objective: 'Primary sitrep goal text.',
    deployment: 'Sitrep deployment instructions.',
    consumable: 'If true, reserve auto-disables once used.',
    mech: 'Show action while mounted.',
    pilot: 'Show action while unmounted.',
    effects: 'Status/condition effect text.',
    exclusive: 'Restrict to Pilot or Mech where supported.'
};

export const COMPCON_ENUMS = {
    activation: ['Free', 'Protocol', 'Quick', 'Full', 'Invade', 'Full Tech', 'Quick Tech', 'Reaction', 'Other'],
    weaponTypes: ['Rifle', 'Cannon', 'Launcher', 'CQB', 'Nexus', 'Melee'],
    mountTypes: ['Main', 'Heavy', 'Aux/Aux', 'Aux', 'Main/Aux', 'Flex', 'Integrated'],
    skillFamily: ['str', 'con', 'dex', 'int', 'cha'],
    statusType: ['Status', 'Condition'],
    reserveType: ['Mech', 'Tactical', 'Resource', 'Bonus'],
    systemType: ['AI', 'Deployable', 'Drone', 'Flight System', 'Shield', 'System', 'Tech']
};

export function getCategoryDefinition(categoryKey) {
    return CATEGORY_DEFINITIONS.find((entry) => entry.key === categoryKey);
}
