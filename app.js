/* Constants */

const STAT_OPTIONS = [
    { value: '', label: '-- Select Stat --' },
    // Speed Stats
    { value: 'fcr', label: 'Faster Cast Rate (FCR)' },
    { value: 'fhr', label: 'Faster Hit Recovery (FHR)' },
    { value: 'frw', label: 'Faster Run/Walk (FRW)' },
    { value: 'ias', label: 'Increased Attack Speed (IAS)' },
    { value: 'fbr', label: 'Faster Block Rate (FBR)' },
    // Resistances
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
    { value: '==', label: '=' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
];

/* State */

let statRowCount = 0;
let savedRules = [];
let groupCount = 0;

/* DOM Elements */

const itemNameSelect = document.getElementById('itemName');
const itemTypeSelect = document.getElementById('itemType');
const itemQualitySelect = document.getElementById('itemQuality');
const itemClassSelect = document.getElementById('itemClass');
const etherealFlagSelect = document.getElementById('etherealFlag');
const statContainer = document.getElementById('statContainer');
const nipOutput = document.getElementById('nipOutput');
const addStatBtn = document.getElementById('addStatBtn');
const addGroupBtn = document.getElementById('addGroupBtn');
const addRuleBtn = document.getElementById('addRuleBtn');
const copyBtn = document.getElementById('copyBtn');
const clearFormBtn = document.getElementById('clearFormBtn');
const clearBtn = document.getElementById('clearBtn');
const emberContainer = document.getElementById('emberContainer');
const toastContainer = document.getElementById('toastContainer');

/* Initialization */

document.addEventListener('DOMContentLoaded', () => {
    initEmberParticles();
    setupSearchableSelects();
    setupEventListeners();
    updateOutput();

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.stat-combobox')) {
            document.querySelectorAll('.stat-combobox.open').forEach(cb => {
                cb.classList.remove('open');
            });
        }
    });
});

/* Ember Bg Animations */

function initEmberParticles() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createEmber(), i * 500);
    }
    setInterval(createEmber, 800);
}

function createEmber() {
    const ember = document.createElement('div');
    ember.className = 'ember';

    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 6;
    const size = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.5) * 100;

    ember.style.cssText = `
        left: ${startX}%;
        width: ${size}px;
        height: ${size}px;
        --drift: ${drift}px;
        animation-duration: ${duration}s;
        animation-delay: ${Math.random() * 2}s;
    `;

    emberContainer.appendChild(ember);

    setTimeout(() => ember.remove(), (duration + 2) * 1000);
}

/* Allows searching in the select boxes */

function setupSearchableSelects() {
    const searchableSelects = [
        { select: itemNameSelect, search: itemNameSelect.parentElement.querySelector('.select-search') },
        { select: itemTypeSelect, search: itemTypeSelect.parentElement.querySelector('.select-search') }
    ];

    searchableSelects.forEach(({ select, search }) => {
        if (!search) return;

        const originalOptions = Array.from(select.querySelectorAll(':scope > option, :scope > optgroup'));

        search.addEventListener('input', () => {
            const query = search.value.toLowerCase().trim();

            if (!query) {
                select.replaceChildren();
                originalOptions.forEach(el => select.appendChild(el.cloneNode(true)));
                return;
            }

            select.replaceChildren();
            originalOptions.forEach(el => {
                if (el.tagName === 'OPTGROUP') {
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

/* Event Listeners */

function setupEventListeners() {
    [itemNameSelect, itemTypeSelect, itemQualitySelect, itemClassSelect, etherealFlagSelect].forEach(select => {
        select.addEventListener('change', updateOutput);
    });

    itemNameSelect.addEventListener('change', updateNameTypeExclusion);
    itemTypeSelect.addEventListener('change', updateNameTypeExclusion);

    addStatBtn.addEventListener('click', addStatRow);
    addGroupBtn.addEventListener('click', addStatGroup);
    addRuleBtn.addEventListener('click', addCurrentRule);
    copyBtn.addEventListener('click', copyToClipboard);
    clearFormBtn.addEventListener('click', clearCurrentRule);
    clearBtn.addEventListener('click', clearAll);
}

function updateNameTypeExclusion() {
    const namesSelected = getSelectedValues(itemNameSelect).length > 0;
    const typesSelected = getSelectedValues(itemTypeSelect).length > 0;

    itemTypeSelect.disabled = namesSelected;
    itemNameSelect.disabled = typesSelected;
}

/* Stat Row */

function addStatRow() {
    const emptyState = statContainer.querySelector('.stat-empty-state');
    if (emptyState) emptyState.style.display = 'none';

    statRowCount++;
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.id = `stat-row-${statRowCount}`;

    const openParen = document.createElement('button');
    openParen.type = 'button';
    openParen.className = 'paren-btn open-paren';
    openParen.textContent = '(';
    openParen.addEventListener('click', () => {
        openParen.classList.toggle('active');
        updateOutput();
    });

    const logicSelect = document.createElement('select');
    logicSelect.className = 'logic-select';
    logicSelect.innerHTML = '<option value="&&">AND</option><option value="||">OR</option>';
    logicSelect.addEventListener('change', () => {
        logicSelect.classList.toggle('is-or', logicSelect.value === '||');
        updateOutput();
    });

    const existingRows = statContainer.querySelectorAll('.stat-row, .stat-group');
    if (existingRows.length === 0) {
        logicSelect.style.visibility = 'hidden';
    }

    const statCombo = createStatCombobox();

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

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.className = 'value-input';
    valueInput.placeholder = '0';
    valueInput.addEventListener('input', updateOutput);

    const closeParen = document.createElement('button');
    closeParen.type = 'button';
    closeParen.className = 'paren-btn close-paren';
    closeParen.textContent = ')';
    closeParen.addEventListener('click', () => {
        closeParen.classList.toggle('active');
        updateOutput();
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-stat-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => removeStatRow(row));

    row.append(openParen, logicSelect, statCombo, opSelect, valueInput, closeParen, removeBtn);
    statContainer.appendChild(row);
    updateOutput();
}

function createStatCombobox() {
    const combo = document.createElement('div');
    combo.className = 'stat-combobox';

    const display = document.createElement('div');
    display.className = 'stat-display';
    display.textContent = '-- Select Stat --';
    display.dataset.value = '';

    const dropdown = document.createElement('div');
    dropdown.className = 'stat-dropdown';

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'stat-dropdown-search';
    search.placeholder = 'Search stats...';

    const options = document.createElement('div');
    options.className = 'stat-options';

    const populateOptions = (filter = '') => {
        options.replaceChildren();
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
                display.textContent = opt.label;
                display.dataset.value = opt.value;
                combo.classList.remove('open');
                search.value = '';
                populateOptions();
                updateOutput();
            });
            options.appendChild(optDiv);
        });
    };
    populateOptions();

    search.addEventListener('input', () => populateOptions(search.value.toLowerCase().trim()));
    search.addEventListener('click', (e) => e.stopPropagation());

    display.addEventListener('click', () => {
        document.querySelectorAll('.stat-combobox.open').forEach(cb => {
            if (cb !== combo) cb.classList.remove('open');
        });
        combo.classList.toggle('open');
        if (combo.classList.contains('open')) {
            setTimeout(() => search.focus(), 0);
        }
    });

    dropdown.append(search, options);
    combo.append(display, dropdown);
    return combo;
}

function removeStatRow(row) {
    row.classList.add('removing');
    setTimeout(() => {
        row.remove();

        const firstRow = statContainer.querySelector('.stat-row, .stat-group');
        if (firstRow) {
            const logicSelect = firstRow.querySelector('.logic-select, .group-logic');
            if (logicSelect) logicSelect.style.visibility = 'hidden';
        }

        const remaining = statContainer.querySelectorAll('.stat-row, .stat-group');
        if (remaining.length === 0) {
            const emptyState = statContainer.querySelector('.stat-empty-state');
            if (emptyState) emptyState.style.display = '';
        }

        updateOutput();
    }, 250);
}

/* Stat Group */

function addStatGroup() {
    const emptyState = statContainer.querySelector('.stat-empty-state');
    if (emptyState) emptyState.style.display = 'none';

    groupCount++;
    const group = document.createElement('div');
    group.className = 'stat-group';
    group.id = `stat-group-${groupCount}`;

    const header = document.createElement('div');
    header.className = 'stat-group-header';

    const groupLogic = document.createElement('select');
    groupLogic.className = 'logic-select group-logic';
    groupLogic.innerHTML = '<option value="&&">AND</option><option value="||">OR</option>';
    groupLogic.addEventListener('change', updateOutput);

    if (statContainer.querySelectorAll('.stat-row, .stat-group').length === 0) {
        groupLogic.style.visibility = 'hidden';
    }

    const label1 = document.createElement('span');
    label1.className = 'group-label';
    label1.textContent = 'Match at least';

    const matchCount = document.createElement('select');
    matchCount.className = 'match-count-select';
    ['1', '2', '3'].forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        matchCount.appendChild(opt);
    });
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All';
    matchCount.appendChild(allOpt);
    matchCount.addEventListener('change', updateOutput);

    const label2 = document.createElement('span');
    label2.className = 'group-label';
    label2.textContent = 'of:';

    const removeGroupBtn = document.createElement('button');
    removeGroupBtn.type = 'button';
    removeGroupBtn.className = 'remove-group-btn';
    removeGroupBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg> Remove';
    removeGroupBtn.addEventListener('click', () => {
        group.classList.add('removing');
        setTimeout(() => {
            group.remove();
            updateFirstItemLogic();

            const remaining = statContainer.querySelectorAll('.stat-row, .stat-group');
            if (remaining.length === 0) {
                const emptyState = statContainer.querySelector('.stat-empty-state');
                if (emptyState) emptyState.style.display = '';
            }

            updateOutput();
        }, 250);
    });

    header.append(groupLogic, label1, matchCount, label2, removeGroupBtn);

    const conditionsContainer = document.createElement('div');
    conditionsContainer.className = 'group-conditions';

    const addConditionBtn = document.createElement('button');
    addConditionBtn.type = 'button';
    addConditionBtn.className = 'add-condition-btn';
    addConditionBtn.innerHTML = '<span>+</span> Add Condition';
    addConditionBtn.addEventListener('click', () => {
        addGroupCondition(conditionsContainer, matchCount);
    });

    group.append(header, conditionsContainer, addConditionBtn);
    statContainer.appendChild(group);

    addGroupCondition(conditionsContainer, matchCount);
    addGroupCondition(conditionsContainer, matchCount);

    updateOutput();
}

function addGroupCondition(container, matchCountSelect) {
    const row = document.createElement('div');
    row.className = 'group-condition-row';

    const statCombo = createStatCombobox();

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

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.className = 'value-input';
    valueInput.placeholder = '0';
    valueInput.addEventListener('input', updateOutput);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-stat-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', () => {
        row.classList.add('removing');
        setTimeout(() => {
            row.remove();
            updateMatchCountOptions(container, matchCountSelect);
            updateOutput();
        }, 250);
    });

    row.append(statCombo, opSelect, valueInput, removeBtn);
    container.appendChild(row);
    updateMatchCountOptions(container, matchCountSelect);
}

function updateMatchCountOptions(container, matchCountSelect) {
    const count = container.querySelectorAll('.group-condition-row').length;
    const current = matchCountSelect.value;

    matchCountSelect.replaceChildren();
    for (let i = 1; i <= count; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = i.toString();
        matchCountSelect.appendChild(opt);
    }
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All';
    matchCountSelect.appendChild(allOpt);

    if (current === 'all' || parseInt(current) <= count) {
        matchCountSelect.value = current;
    } else {
        matchCountSelect.value = '1';
    }
}

function updateFirstItemLogic() {
    const firstItem = statContainer.querySelector('.stat-row, .stat-group');
    if (firstItem) {
        const logicSelect = firstItem.querySelector('.logic-select, .group-logic');
        if (logicSelect) logicSelect.style.visibility = 'hidden';
    }
}

/* NIP Generation */

function getSelectedValues(selectElement) {
    return Array.from(selectElement.selectedOptions).map(opt => opt.value).filter(v => v);
}

function generateMultiCondition(property, values, useOperator = '==') {
    if (values.length === 0) return '';
    if (values.length === 1) {
        if (property === 'quality' || property === 'flag') {
            return `[${property}] ${values[0]}`;
        }
        return `[${property}] ${useOperator} ${values[0]}`;
    }
    const conditions = values.map(v => {
        if (property === 'quality' || property === 'flag') {
            return `[${property}] ${v}`;
        }
        return `[${property}] ${useOperator} ${v}`;
    });
    return `(${conditions.join(' || ')})`;
}

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

        if (stat && value !== '') {
            if (openParen?.classList.contains('active')) openCount++;
            if (closeParen?.classList.contains('active')) {
                if (openCount <= 0) {
                    errors.push(`Row ${index + 1}: Unmatched closing parenthesis`);
                } else {
                    openCount--;
                }
            }
        }
    });

    if (openCount > 0) {
        errors.push(`${openCount} unclosed parenthesis`);
    }

    return errors;
}

function generateCurrentNipRule() {
    const parts = [];

    const names = getSelectedValues(itemNameSelect);
    if (names.length > 0) {
        parts.push(generateMultiCondition('name', names));
    }

    const types = getSelectedValues(itemTypeSelect);
    if (names.length === 0 && types.length > 0) {
        parts.push(generateMultiCondition('type', types));
    }

    const qualities = getSelectedValues(itemQualitySelect);
    if (qualities.length > 0) {
        parts.push(generateMultiCondition('quality', qualities));
    }

    const classes = getSelectedValues(itemClassSelect);
    if (classes.length > 0) {
        parts.push(generateMultiCondition('class', classes));
    }

    const ethereals = getSelectedValues(etherealFlagSelect);
    if (ethereals.length > 0) {
        parts.push(generateMultiCondition('flag', ethereals));
    }

    let nipLine = parts.join(' && ');

    const statItems = statContainer.querySelectorAll(':scope > .stat-row, :scope > .stat-group');
    let statExpression = '';
    let itemIndex = 0;

    statItems.forEach((item) => {
        if (item.classList.contains('stat-row')) {
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
                if (openParen?.classList.contains('active')) {
                    statExpression += '(';
                }
                statExpression += `[${stat}] ${op} ${value}`;
                if (closeParen?.classList.contains('active')) {
                    statExpression += ')';
                }
                itemIndex++;
            }
        } else if (item.classList.contains('stat-group')) {
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
                    groupExpr = `(${conditions.join(' && ')})`;
                } else {
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

/* Handles the output in this bitch */

function updateOutput() {
    const currentRule = generateCurrentNipRule();
    const parenErrors = validateParentheses();

    nipOutput.replaceChildren();

    if (parenErrors.length > 0) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = '⚠ ' + parenErrors.join(' | ');
        nipOutput.appendChild(errorDiv);
    }

    if (savedRules.length > 0) {
        const savedDiv = document.createElement('div');
        savedDiv.className = 'saved-rules';
        savedDiv.textContent = savedRules.join('\n');
        nipOutput.appendChild(savedDiv);
    }

    if (currentRule) {
        if (savedRules.length > 0) {
            const currentDiv = document.createElement('div');
            currentDiv.className = 'current-rule';
            currentDiv.textContent = '// Building:\n' + currentRule;
            nipOutput.appendChild(currentDiv);
        } else {
            nipOutput.appendChild(document.createTextNode(currentRule));
        }
    } else if (savedRules.length === 0 && parenErrors.length === 0) {
        const placeholder = document.createElement('span');
        placeholder.className = 'output-placeholder';
        placeholder.innerHTML = '<span class="placeholder-rune"></span>Select options to inscribe your filter...';
        nipOutput.appendChild(placeholder);
    }
}

/* Actions */

function addCurrentRule() {
    const currentRule = generateCurrentNipRule();
    const parenErrors = validateParentheses();

    if (!currentRule) {
        showToast('Forge a rule first!', 'warning');
        return;
    }

    if (parenErrors.length > 0) {
        showToast('Fix parentheses first!', 'warning');
        return;
    }

    savedRules.push(currentRule);
    clearCurrentRule();
    showToast('Rule inscribed!', 'success');
}

function clearCurrentRule() {
    [itemNameSelect, itemTypeSelect, itemQualitySelect, itemClassSelect, etherealFlagSelect].forEach(select => {
        Array.from(select.options).forEach(opt => opt.selected = false);
    });

    itemNameSelect.disabled = false;
    itemTypeSelect.disabled = false;

    document.querySelectorAll('.select-search').forEach(input => input.value = '');

    const items = statContainer.querySelectorAll('.stat-row, .stat-group');
    items.forEach((item, i) => {
        setTimeout(() => item.classList.add('removing'), i * 50);
    });

    setTimeout(() => {
        const emptyState = statContainer.querySelector('.stat-empty-state');
        statContainer.replaceChildren();
        if (emptyState) {
            emptyState.style.display = '';
            statContainer.appendChild(emptyState);
        }
        statRowCount = 0;
        groupCount = 0;
        updateOutput();
    }, items.length * 50 + 300);
}

function copyToClipboard() {
    let allRules = [...savedRules];
    const currentRule = generateCurrentNipRule();
    if (currentRule) allRules.push(currentRule);

    if (allRules.length === 0) {
        showToast('Nothing to copy!', 'warning');
        return;
    }

    navigator.clipboard.writeText(allRules.join('\n')).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Copy failed', 'error');
    });
}

function clearAll() {
    savedRules = [];
    clearCurrentRule();
    showToast('All cleared!', 'info');
}

/* Toast Notifications */

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
