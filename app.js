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
    setupSearchableSelects();
    setupEventListeners();
    updateOutput();
});

// Make multi-selects searchable by adding filter inputs (only for long lists)
function setupSearchableSelects() {
    const searchableSelects = [
        { select: itemNameSelect, placeholder: '🔍 Search items...' },
        { select: itemTypeSelect, placeholder: '🔍 Search types...' }
    ];

    searchableSelects.forEach(({ select, placeholder }) => {
        // Create search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'select-search';
        searchInput.placeholder = placeholder;

        // Insert before the select
        select.parentNode.insertBefore(searchInput, select);

        // Store original options (only direct children to avoid duplicates)
        const originalOptions = Array.from(select.querySelectorAll(':scope > option, :scope > optgroup'));

        // Filter on input
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();

            if (!query) {
                // Restore all options
                select.innerHTML = '';
                originalOptions.forEach(el => select.appendChild(el.cloneNode(true)));
                return;
            }

            // Filter options
            select.innerHTML = '';
            originalOptions.forEach(el => {
                if (el.tagName === 'OPTGROUP') {
                    // Clone optgroup and filter its children
                    const groupClone = el.cloneNode(false);
                    Array.from(el.querySelectorAll('option')).forEach(opt => {
                        if (opt.textContent.toLowerCase().includes(query) ||
                            opt.value.toLowerCase().includes(query)) {
                            groupClone.appendChild(opt.cloneNode(true));
                        }
                    });
                    if (groupClone.children.length > 0) {
                        select.appendChild(groupClone);
                    }
                } else if (el.tagName === 'OPTION') {
                    if (el.textContent.toLowerCase().includes(query) ||
                        el.value.toLowerCase().includes(query)) {
                        select.appendChild(el.cloneNode(true));
                    }
                }
            });
        });
    });
}

function setupEventListeners() {
    // Property selects - update output on change
    [itemNameSelect, itemTypeSelect, itemQualitySelect, itemClassSelect, etherealFlagSelect].forEach(select => {
        select.addEventListener('change', updateOutput);
    });

    // Mutual exclusion between itemName and itemType
    itemNameSelect.addEventListener('change', updateNameTypeExclusion);
    itemTypeSelect.addEventListener('change', updateNameTypeExclusion);

    addStatBtn.addEventListener('click', addStatRow);

    // Add Group button
    const addGroupBtn = document.getElementById('addGroupBtn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', addStatGroup);
    }

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

// Mutual exclusion: disable itemType when itemName has selections, and vice versa
function updateNameTypeExclusion() {
    const namesSelected = getSelectedValues(itemNameSelect).length > 0;
    const typesSelected = getSelectedValues(itemTypeSelect).length > 0;

    if (namesSelected) {
        itemTypeSelect.disabled = true;
        itemTypeSelect.classList.add('disabled-exclusive');
    } else {
        itemTypeSelect.disabled = false;
        itemTypeSelect.classList.remove('disabled-exclusive');
    }

    if (typesSelected) {
        itemNameSelect.disabled = true;
        itemNameSelect.classList.add('disabled-exclusive');
    } else {
        itemNameSelect.disabled = false;
        itemNameSelect.classList.remove('disabled-exclusive');
    }
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

    // Stat select - custom searchable combobox
    const statCombo = document.createElement('div');
    statCombo.className = 'stat-combobox';

    const statDisplay = document.createElement('div');
    statDisplay.className = 'stat-display';
    statDisplay.textContent = '-- Select Stat --';
    statDisplay.dataset.value = '';

    const statDropdown = document.createElement('div');
    statDropdown.className = 'stat-dropdown';

    const statSearch = document.createElement('input');
    statSearch.type = 'text';
    statSearch.className = 'stat-dropdown-search';
    statSearch.placeholder = '🔍 Type to search...';

    const statOptions = document.createElement('div');
    statOptions.className = 'stat-options';

    // Populate options
    const populateOptions = (filter = '') => {
        statOptions.innerHTML = '';
        STAT_OPTIONS.forEach(opt => {
            if (opt.value === '') return; // Skip placeholder
            if (filter && !opt.label.toLowerCase().includes(filter) && !opt.value.toLowerCase().includes(filter)) {
                return;
            }
            const optDiv = document.createElement('div');
            optDiv.className = 'stat-option';
            optDiv.textContent = opt.label;
            optDiv.dataset.value = opt.value;
            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                statDisplay.textContent = opt.label;
                statDisplay.dataset.value = opt.value;
                statCombo.classList.remove('open');
                statSearch.value = '';
                populateOptions();
                updateOutput();
            });
            statOptions.appendChild(optDiv);
        });
    };
    populateOptions();

    statSearch.addEventListener('input', () => {
        populateOptions(statSearch.value.toLowerCase().trim());
    });

    statSearch.addEventListener('click', (e) => e.stopPropagation());

    statDisplay.addEventListener('click', () => {
        document.querySelectorAll('.stat-combobox.open').forEach(cb => {
            if (cb !== statCombo) cb.classList.remove('open');
        });
        statCombo.classList.toggle('open');
        if (statCombo.classList.contains('open')) {
            setTimeout(() => statSearch.focus(), 0);
        }
    });

    statDropdown.appendChild(statSearch);
    statDropdown.appendChild(statOptions);
    statCombo.appendChild(statDisplay);
    statCombo.appendChild(statDropdown);

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
    row.appendChild(statCombo);
    row.appendChild(opSelect);
    row.appendChild(valueInput);
    row.appendChild(closeParen);
    row.appendChild(removeBtn);
    statContainer.appendChild(row);

    updateOutput();
}

let groupCount = 0;

function addStatGroup() {
    groupCount++;
    const group = document.createElement('div');
    group.className = 'stat-group';
    group.id = `stat-group-${groupCount}`;

    // Group header
    const header = document.createElement('div');
    header.className = 'stat-group-header';

    // Logic connector for the group (AND/OR with previous)
    const groupLogic = document.createElement('select');
    groupLogic.className = 'logic-select group-logic';
    groupLogic.innerHTML = `
        <option value="&&">AND</option>
        <option value="||">OR</option>
    `;
    groupLogic.addEventListener('change', updateOutput);

    // Hide logic for first item
    if (statContainer.children.length === 0) {
        groupLogic.style.visibility = 'hidden';
    }

    const matchLabel = document.createElement('span');
    matchLabel.className = 'group-label';
    matchLabel.textContent = 'Match at least';

    const matchCount = document.createElement('select');
    matchCount.className = 'match-count-select';
    matchCount.innerHTML = `
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="all">All</option>
    `;
    matchCount.addEventListener('change', updateOutput);

    const ofLabel = document.createElement('span');
    ofLabel.className = 'group-label';
    ofLabel.textContent = 'of these:';

    const removeGroupBtn = document.createElement('button');
    removeGroupBtn.type = 'button';
    removeGroupBtn.className = 'remove-group-btn';
    removeGroupBtn.textContent = '✕ Remove Group';
    removeGroupBtn.addEventListener('click', () => {
        group.remove();
        updateFirstItemLogic();
        updateOutput();
    });

    header.appendChild(groupLogic);
    header.appendChild(matchLabel);
    header.appendChild(matchCount);
    header.appendChild(ofLabel);
    header.appendChild(removeGroupBtn);

    // Group conditions container
    const conditionsContainer = document.createElement('div');
    conditionsContainer.className = 'group-conditions';

    // Add condition button
    const addConditionBtn = document.createElement('button');
    addConditionBtn.type = 'button';
    addConditionBtn.className = 'add-condition-btn';
    addConditionBtn.textContent = '+ Add Condition';
    addConditionBtn.addEventListener('click', () => {
        addGroupCondition(conditionsContainer, matchCount);
    });

    group.appendChild(header);
    group.appendChild(conditionsContainer);
    group.appendChild(addConditionBtn);

    statContainer.appendChild(group);

    // Add two initial conditions
    addGroupCondition(conditionsContainer, matchCount);
    addGroupCondition(conditionsContainer, matchCount);

    updateOutput();
}

function addGroupCondition(container, matchCountSelect) {
    const row = document.createElement('div');
    row.className = 'group-condition-row';

    // Stat combobox (reuse same pattern)
    const statCombo = document.createElement('div');
    statCombo.className = 'stat-combobox';

    const statDisplay = document.createElement('div');
    statDisplay.className = 'stat-display';
    statDisplay.textContent = '-- Select Stat --';
    statDisplay.dataset.value = '';

    const statDropdown = document.createElement('div');
    statDropdown.className = 'stat-dropdown';

    const statSearch = document.createElement('input');
    statSearch.type = 'text';
    statSearch.className = 'stat-dropdown-search';
    statSearch.placeholder = '🔍 Type to search...';

    const statOptions = document.createElement('div');
    statOptions.className = 'stat-options';

    const populateOptions = (filter = '') => {
        statOptions.innerHTML = '';
        STAT_OPTIONS.forEach(opt => {
            if (opt.value === '') return;
            if (filter && !opt.label.toLowerCase().includes(filter) && !opt.value.toLowerCase().includes(filter)) {
                return;
            }
            const optDiv = document.createElement('div');
            optDiv.className = 'stat-option';
            optDiv.textContent = opt.label;
            optDiv.dataset.value = opt.value;
            optDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                statDisplay.textContent = opt.label;
                statDisplay.dataset.value = opt.value;
                statCombo.classList.remove('open');
                statSearch.value = '';
                populateOptions();
                updateMatchCountOptions(container, matchCountSelect);
                updateOutput();
            });
            statOptions.appendChild(optDiv);
        });
    };
    populateOptions();

    statSearch.addEventListener('input', () => {
        populateOptions(statSearch.value.toLowerCase().trim());
    });
    statSearch.addEventListener('click', (e) => e.stopPropagation());

    statDisplay.addEventListener('click', () => {
        document.querySelectorAll('.stat-combobox.open').forEach(cb => {
            if (cb !== statCombo) cb.classList.remove('open');
        });
        statCombo.classList.toggle('open');
        if (statCombo.classList.contains('open')) {
            setTimeout(() => statSearch.focus(), 0);
        }
    });

    statDropdown.appendChild(statSearch);
    statDropdown.appendChild(statOptions);
    statCombo.appendChild(statDisplay);
    statCombo.appendChild(statDropdown);

    // Operator
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

    // Value
    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.className = 'value-input';
    valueInput.placeholder = 'Value';
    valueInput.addEventListener('input', updateOutput);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-stat-btn';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', () => {
        row.remove();
        updateMatchCountOptions(container, matchCountSelect);
        updateOutput();
    });

    row.appendChild(statCombo);
    row.appendChild(opSelect);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);
    container.appendChild(row);

    updateMatchCountOptions(container, matchCountSelect);
}

function updateMatchCountOptions(container, matchCountSelect) {
    const conditionCount = container.querySelectorAll('.group-condition-row').length;
    const currentValue = matchCountSelect.value;

    matchCountSelect.innerHTML = '';
    for (let i = 1; i <= conditionCount; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = i.toString();
        matchCountSelect.appendChild(opt);
    }
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All';
    matchCountSelect.appendChild(allOpt);

    // Restore value if still valid
    if (currentValue === 'all' || parseInt(currentValue) <= conditionCount) {
        matchCountSelect.value = currentValue;
    } else {
        matchCountSelect.value = '1';
    }
}

function updateFirstItemLogic() {
    const firstItem = statContainer.querySelector('.stat-row, .stat-group');
    if (firstItem) {
        const logicSelect = firstItem.querySelector('.logic-select, .group-logic');
        if (logicSelect) {
            logicSelect.style.visibility = 'hidden';
        }
    }
}

// Helper to get selected values from a multi-select
function getSelectedValues(selectElement) {
    return Array.from(selectElement.selectedOptions).map(opt => opt.value).filter(v => v);
}

// Helper to generate multi-value condition (wraps in OR if multiple)
function generateMultiCondition(property, values, useOperator = '==') {
    if (values.length === 0) return '';
    if (values.length === 1) {
        // Quality/ethereal values may already include operator
        if (property === 'quality' || property === 'flag') {
            return `[${property}] ${values[0]}`;
        }
        return `[${property}] ${useOperator} ${values[0]}`;
    }
    // Multiple values - wrap in parentheses with OR
    const conditions = values.map(v => {
        if (property === 'quality' || property === 'flag') {
            return `[${property}] ${v}`;
        }
        return `[${property}] ${useOperator} ${v}`;
    });
    return `(${conditions.join(' || ')})`;
}

// Validate parentheses balance in stat rows
function validateParentheses() {
    const statRows = statContainer.querySelectorAll('.stat-row');
    let openCount = 0;
    let errors = [];

    statRows.forEach((row, index) => {
        const openParen = row.querySelector('.open-paren');
        const closeParen = row.querySelector('.close-paren');
        const statDisplay = row.querySelector('.stat-display');
        const stat = statDisplay ? statDisplay.dataset.value : '';
        const value = row.querySelector('.value-input').value;

        // Only count parens for valid stat rows
        if (stat && value !== '') {
            if (openParen && openParen.classList.contains('active')) {
                openCount++;
            }
            if (closeParen && closeParen.classList.contains('active')) {
                if (openCount <= 0) {
                    errors.push(`Row ${index + 1}: Cannot close parenthesis without opening one first`);
                } else {
                    openCount--;
                }
            }
        }
    });

    if (openCount > 0) {
        errors.push(`${openCount} unclosed parenthesis - add closing paren(s)`);
    }

    return errors;
}

function generateCurrentNipRule() {
    const parts = [];

    // Name (multi-select)
    const names = getSelectedValues(itemNameSelect);
    if (names.length > 0) {
        parts.push(generateMultiCondition('name', names));
    }

    // Type (multi-select) - only if no names selected
    const types = getSelectedValues(itemTypeSelect);
    if (names.length === 0 && types.length > 0) {
        parts.push(generateMultiCondition('type', types));
    }

    // Quality (multi-select)
    const qualities = getSelectedValues(itemQualitySelect);
    if (qualities.length > 0) {
        parts.push(generateMultiCondition('quality', qualities));
    }

    // Class/Tier (multi-select)
    const classes = getSelectedValues(itemClassSelect);
    if (classes.length > 0) {
        parts.push(generateMultiCondition('class', classes));
    }

    // Ethereal (multi-select)
    const ethereals = getSelectedValues(etherealFlagSelect);
    if (ethereals.length > 0) {
        parts.push(generateMultiCondition('flag', ethereals));
    }

    // Build item property section
    let nipLine = parts.join(' && ');

    // Process all stat items (rows and groups) in order
    const statItems = statContainer.querySelectorAll(':scope > .stat-row, :scope > .stat-group');
    let statExpression = '';
    let itemIndex = 0;

    statItems.forEach((item) => {
        if (item.classList.contains('stat-row')) {
            // Regular stat row
            const openParen = item.querySelector('.open-paren');
            const closeParen = item.querySelector('.close-paren');
            const logic = item.querySelector('.logic-select').value;
            const statDisplay = item.querySelector('.stat-display');
            const stat = statDisplay ? statDisplay.dataset.value : '';
            const op = item.querySelector('.op-select').value;
            const value = item.querySelector('.value-input').value;

            if (stat && value !== '') {
                if (statExpression && itemIndex > 0) {
                    statExpression += ` ${logic} `;
                }
                if (openParen && openParen.classList.contains('active')) {
                    statExpression += '(';
                }
                statExpression += `[${stat}] ${op} ${value}`;
                if (closeParen && closeParen.classList.contains('active')) {
                    statExpression += ')';
                }
                itemIndex++;
            }
        } else if (item.classList.contains('stat-group')) {
            // Stat group with "match N of" logic
            const groupLogic = item.querySelector('.group-logic').value;
            const matchCount = item.querySelector('.match-count-select').value;
            const conditions = [];

            item.querySelectorAll('.group-condition-row').forEach(row => {
                const statDisplay = row.querySelector('.stat-display');
                const stat = statDisplay ? statDisplay.dataset.value : '';
                const op = row.querySelector('.op-select').value;
                const value = row.querySelector('.value-input').value;

                if (stat && value !== '') {
                    conditions.push(`[${stat}] ${op} ${value}`);
                }
            });

            if (conditions.length > 0) {
                let groupExpr = '';

                if (matchCount === 'all' || parseInt(matchCount) >= conditions.length) {
                    // All must match - just AND them together
                    groupExpr = `(${conditions.join(' && ')})`;
                } else {
                    // Generate combinations for "at least N"
                    const combos = getCombinations(conditions, parseInt(matchCount));
                    const comboExprs = combos.map(combo => `(${combo.join(' && ')})`);
                    groupExpr = `(${comboExprs.join(' || ')})`;
                }

                if (statExpression && itemIndex > 0) {
                    statExpression += ` ${groupLogic} `;
                }
                statExpression += groupExpr;
                itemIndex++;
            }
        }
    });

    if (statExpression) {
        nipLine += ' # ' + statExpression;
    }

    return nipLine;
}

// Generate combinations of size k from array
function getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];

    const result = [];

    function combine(start, combo) {
        if (combo.length === k) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            combo.push(arr[i]);
            combine(i + 1, combo);
            combo.pop();
        }
    }

    combine(0, []);
    return result;
}


function updateOutput() {
    const currentRule = generateCurrentNipRule();
    const parenErrors = validateParentheses();

    let outputHtml = '';

    // Show parentheses validation errors
    if (parenErrors.length > 0) {
        outputHtml += '<div class="validation-error">⚠️ ' + parenErrors.join('<br>⚠️ ') + '</div>';
    }

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
    } else if (savedRules.length === 0 && parenErrors.length === 0) {
        outputHtml = '<span class="placeholder">Select options above to generate your NIP filter...</span>';
    }

    nipOutput.innerHTML = outputHtml;
}

function addCurrentRule() {
    const currentRule = generateCurrentNipRule();
    const parenErrors = validateParentheses();

    if (!currentRule) {
        showToast('⚠️ Build a rule first!', 'warning');
        return;
    }

    if (parenErrors.length > 0) {
        showToast('⚠️ Fix parentheses first!', 'warning');
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
