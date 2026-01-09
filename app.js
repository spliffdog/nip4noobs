// NIP Filter Builder - Main Application

// Stat options for dropdown
const STAT_OPTIONS = [
    { value: '', label: '-- Select Stat --' },
    // Common Stats
    { value: 'fcr', label: 'Faster Cast Rate (FCR)' },
    { value: 'fhr', label: 'Faster Hit Recovery (FHR)' },
    { value: 'frw', label: 'Faster Run/Walk (FRW)' },
    { value: 'ias', label: 'Increased Attack Speed (IAS)' },
    { value: 'fbr', label: 'Faster Block Rate (FBR)' },
    // Resists
    { value: 'fireresist', label: 'Fire Resist' },
    { value: 'coldresist', label: 'Cold Resist' },
    { value: 'lightresist', label: 'Lightning Resist' },
    { value: 'poisonresist', label: 'Poison Resist' },
    { value: 'allresist', label: 'All Resist' },
    // Life/Mana
    { value: 'maxhp', label: 'Max Life' },
    { value: 'maxmana', label: 'Max Mana' },
    { value: 'hpregen', label: 'Life Regen' },
    // Attributes
    { value: 'strength', label: 'Strength' },
    { value: 'dexterity', label: 'Dexterity' },
    { value: 'vitality', label: 'Vitality' },
    { value: 'energy', label: 'Energy' },
    // Damage
    { value: 'enhanceddamage', label: 'Enhanced Damage' },
    { value: 'enhanceddefense', label: 'Enhanced Defense' },
    { value: 'maxdamage', label: 'Max Damage' },
    { value: 'mindamage', label: 'Min Damage' },
    { value: 'defense', label: 'Defense' },
    { value: 'plusdefense', label: '+Defense' },
    // Leech
    { value: 'lifeleech', label: 'Life Leech' },
    { value: 'manaleech', label: 'Mana Leech' },
    // Magic Find
    { value: 'itemmagicbonus', label: 'Magic Find (MF)' },
    { value: 'itemgoldbonus', label: 'Gold Find (GF)' },
    // Skills
    { value: 'itemallskills', label: '+All Skills' },
    { value: 'sorceressskills', label: '+Sorceress Skills' },
    { value: 'necromancerskills', label: '+Necromancer Skills' },
    { value: 'paladinskills', label: '+Paladin Skills' },
    { value: 'amazonskills', label: '+Amazon Skills' },
    { value: 'barbarianskills', label: '+Barbarian Skills' },
    { value: 'druidskills', label: '+Druid Skills' },
    { value: 'assassinskills', label: '+Assassin Skills' },
    // Skill Tabs
    { value: 'fireskilltab', label: 'Fire Skills Tab' },
    { value: 'coldskilltab', label: 'Cold Skills Tab' },
    { value: 'lightningskilltab', label: 'Lightning Skills Tab' },
    { value: 'palicombatskilltab', label: 'Paladin Combat Tab' },
    { value: 'trapsskilltab', label: 'Traps Tab' },
    { value: 'javelinandspearskilltab', label: 'Javelin/Spear Tab' },
    { value: 'bowandcrossbowskilltab', label: 'Bow/Crossbow Tab' },
    // Sockets
    { value: 'sockets', label: 'Sockets' },
    // Other
    { value: 'damageresist', label: 'Damage Reduced %' },
    { value: 'tohit', label: 'Attack Rating' },
    { value: 'itemreqpercent', label: 'Requirements %' },
];

const OPERATORS = [
    { value: '==', label: '= (equals)' },
    { value: '>=', label: '>= (at least)' },
    { value: '<=', label: '<= (at most)' },
    { value: '>', label: '> (more than)' },
    { value: '<', label: '< (less than)' },
];

// State
let statRowCount = 0;
let savedRules = [];

// DOM Elements
const itemNameSelect = document.getElementById('itemName');
const itemTypeSelect = document.getElementById('itemType');
const itemQualitySelect = document.getElementById('itemQuality');
const itemClassSelect = document.getElementById('itemClass');
const etherealFlagSelect = document.getElementById('etherealFlag');
const statContainer = document.getElementById('statContainer');
const nipOutput = document.getElementById('nipOutput');
const addStatBtn = document.getElementById('addStatBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateOutput();
});

function setupEventListeners() {
    // Property selects - update output on change
    [itemNameSelect, itemTypeSelect, itemQualitySelect, itemClassSelect, etherealFlagSelect].forEach(select => {
        select.addEventListener('change', updateOutput);
    });

    addStatBtn.addEventListener('click', addStatRow);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);

    // Add Rule button setup - we need to add this button dynamically
    const outputActions = document.querySelector('.output-actions');

    // Add Rule button
    const addRuleBtn = document.createElement('button');
    addRuleBtn.type = 'button';
    addRuleBtn.id = 'addRuleBtn';
    addRuleBtn.className = 'action-btn add-rule-btn';
    addRuleBtn.innerHTML = '➕ Add Rule';
    addRuleBtn.addEventListener('click', addCurrentRule);
    outputActions.insertBefore(addRuleBtn, copyBtn);

    // Clear Current button
    const clearCurrentBtn = document.createElement('button');
    clearCurrentBtn.type = 'button';
    clearCurrentBtn.className = 'action-btn clear-current-btn';
    clearCurrentBtn.innerHTML = '🔄 Clear Form';
    clearCurrentBtn.addEventListener('click', clearCurrentRule);
    outputActions.insertBefore(clearCurrentBtn, clearBtn);
}

function addStatRow() {
    statRowCount++;
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.id = `stat-row-${statRowCount}`;

    // Open paren button
    const openParen = document.createElement('button');
    openParen.type = 'button';
    openParen.className = 'paren-btn open-paren';
    openParen.textContent = '(';
    openParen.title = 'Start group';
    openParen.addEventListener('click', () => {
        openParen.classList.toggle('active');
        updateOutput();
    });

    // Logic connector (AND/OR) - only show if not the first stat
    const logicSelect = document.createElement('select');
    logicSelect.className = 'logic-select';
    logicSelect.innerHTML = `
        <option value="&&">AND</option>
        <option value="||">OR</option>
    `;

    // Toggle visual styling based on AND/OR selection
    const updateLogicStyle = () => {
        if (logicSelect.value === '||') {
            logicSelect.classList.add('is-or');
            row.classList.remove('and-group');
            row.classList.add('or-break');
        } else {
            logicSelect.classList.remove('is-or');
            row.classList.add('and-group');
            row.classList.remove('or-break');
        }
        updateOutput();
    };

    logicSelect.addEventListener('change', updateLogicStyle);

    // Hide for first stat row
    if (statContainer.querySelectorAll('.stat-row').length === 0) {
        logicSelect.style.visibility = 'hidden';
    } else {
        // Default to AND group styling for non-first rows
        row.classList.add('and-group');
    }

    // Stat select
    const statSelect = document.createElement('select');
    statSelect.className = 'stat-select';
    STAT_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        statSelect.appendChild(option);
    });
    statSelect.addEventListener('change', updateOutput);

    // Operator select
    const opSelect = document.createElement('select');
    opSelect.className = 'op-select';
    OPERATORS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        opSelect.appendChild(option);
    });
    opSelect.value = '>=';
    opSelect.addEventListener('change', updateOutput);

    // Value input
    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.className = 'value-input';
    valueInput.placeholder = 'Value';
    valueInput.addEventListener('input', updateOutput);

    // Close paren button
    const closeParen = document.createElement('button');
    closeParen.type = 'button';
    closeParen.className = 'paren-btn close-paren';
    closeParen.textContent = ')';
    closeParen.title = 'End group';
    closeParen.addEventListener('click', () => {
        closeParen.classList.toggle('active');
        updateOutput();
    });

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-stat-btn';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => {
        row.remove();
        // Update visibility of first row's logic select
        const firstRow = statContainer.querySelector('.stat-row');
        if (firstRow) {
            firstRow.querySelector('.logic-select').style.visibility = 'hidden';
        }
        updateOutput();
    });

    row.appendChild(openParen);
    row.appendChild(logicSelect);
    row.appendChild(statSelect);
    row.appendChild(opSelect);
    row.appendChild(valueInput);
    row.appendChild(closeParen);
    row.appendChild(removeBtn);
    statContainer.appendChild(row);

    updateOutput();
}

function generateCurrentNipRule() {
    const parts = [];

    // Name or Type
    const name = itemNameSelect.value;
    const type = itemTypeSelect.value;

    if (name) {
        parts.push(`[name] == ${name}`);
    } else if (type) {
        parts.push(`[type] == ${type}`);
    }

    // Quality
    const quality = itemQualitySelect.value;
    if (quality) {
        parts.push(`[quality] ${quality}`);
    }

    // Class/Tier
    const itemClass = itemClassSelect.value;
    if (itemClass) {
        parts.push(`[class] == ${itemClass}`);
    }

    // Ethereal
    const ethereal = etherealFlagSelect.value;
    if (ethereal) {
        parts.push(`[flag] ${ethereal}`);
    }

    // Build item property section
    let nipLine = parts.join(' && ');

    // Stat requirements with explicit parentheses from UI
    const statRows = statContainer.querySelectorAll('.stat-row');
    let statExpression = '';

    statRows.forEach((row, index) => {
        const openParen = row.querySelector('.open-paren');
        const closeParen = row.querySelector('.close-paren');
        const logic = row.querySelector('.logic-select').value;
        const stat = row.querySelector('.stat-select').value;
        const op = row.querySelector('.op-select').value;
        const value = row.querySelector('.value-input').value;

        if (stat && value !== '') {
            // Add logic operator (except for first condition)
            if (statExpression && index > 0) {
                statExpression += ` ${logic} `;
            }

            // Add opening paren if active
            if (openParen && openParen.classList.contains('active')) {
                statExpression += '(';
            }

            // Add the stat condition
            statExpression += `[${stat}] ${op} ${value}`;

            // Add closing paren if active
            if (closeParen && closeParen.classList.contains('active')) {
                statExpression += ')';
            }
        }
    });

    if (statExpression) {
        nipLine += ' # ' + statExpression;
    }

    return nipLine;
}


function updateOutput() {
    const currentRule = generateCurrentNipRule();

    let outputHtml = '';

    // Show saved rules first
    if (savedRules.length > 0) {
        outputHtml += '<div class="saved-rules">';
        savedRules.forEach(rule => {
            outputHtml += rule + '\n';
        });
        outputHtml += '</div>';
    }

    // Show current rule being built
    if (currentRule) {
        if (savedRules.length > 0) {
            outputHtml += '<div class="current-rule">// Current rule:\n' + currentRule + '</div>';
        } else {
            outputHtml += currentRule;
        }
    } else if (savedRules.length === 0) {
        outputHtml = '<span class="placeholder">Select options above to generate your NIP filter...</span>';
    }

    nipOutput.innerHTML = outputHtml;
}

function addCurrentRule() {
    const currentRule = generateCurrentNipRule();

    if (!currentRule) {
        showToast('⚠️ Build a rule first!', 'warning');
        return;
    }

    savedRules.push(currentRule);
    clearCurrentRule();
    showToast('✅ Rule added!', 'success');
}

function clearCurrentRule() {
    // Reset all form fields
    itemNameSelect.value = '';
    itemTypeSelect.value = '';
    itemQualitySelect.value = '';
    itemClassSelect.value = '';
    etherealFlagSelect.value = '';

    // Clear all stat rows
    statContainer.innerHTML = '';
    statRowCount = 0;

    updateOutput();
}

function copyToClipboard() {
    // Get all rules including current
    let allRules = [...savedRules];
    const currentRule = generateCurrentNipRule();
    if (currentRule) {
        allRules.push(currentRule);
    }

    if (allRules.length === 0) {
        showToast('⚠️ Nothing to copy!', 'warning');
        return;
    }

    const text = allRules.join('\n');
    navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('❌ Failed to copy', 'error');
    });
}

function clearAll() {
    savedRules = [];
    clearCurrentRule();
    showToast('🗑️ All cleared!', 'info');
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Color based on type
    const colors = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#6366f1'
    };
    toast.style.background = colors[type] || colors.success;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}
