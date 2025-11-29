// Assure-toi que <script src="index.js" defer></script> ou que le script est chargé après le HTML.

// ---------- Données ----------
const TYPES = [
  'Normal','Grass','Fire','Water','Electric','Ice','Fighting','Poison','Ground','Flying',
  'Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'
];

const TYPE_CHART = {
  Normal: { Steel:0.5, Rock:0.5, Ghost:0 },
  Grass: { Water:2, Rock:2, Ground:2, Steel:0.5, Dragon:0.5, Fire:0.5, Bug:0.5, Grass:0.5, Poison:0.5, Flying:0.5 },
  Fire: { Steel:2, Ice:2, Bug:2, Grass:2, Dragon:0.5, Water:0.5, Fire:0.5, Rock:0.5 }, 
  Water: { Fire:2, Rock:2, Ground:2, Dragon:0.5, Water:0.5, Grass:0.5 },
  Electric: { Water:2, Flying:2, Dragon:0.5, Electric:0.5, Grass:0.5, Ground:0 },
  Ice: { Dragon:2, Grass:2, Ground:2, Flying:2, Steel:0.5, Water:0.5, Fire:0.5, Ice:0.5},
  Fighting: { Steel:2, Ice:2, Normal:2, Rock:2, Dark:2, Bug:0.5, Poison:0.5, Psychic:0.5, Flying:0.5, Ghost:0 }, 
  Poison: { Grass:2, Poison:0.5, Rock:0.5, Ground:0.5, Ghost:0.5, Steel:0 },
  Ground: { Steel:2, Electric:2, Fire:2, Poison:2, Rock:2, Bug:0.5, Grass:0.5, Flying:0 },
  Flying: { Fighting:2, Bug:2, Grass:2, Steel:0.5, Electric:0.5, Rock:0.5 },
  Psychic: { Fighting:2, Poison:2, Steel:0.5, Psychic:0.5, Dark:0 },
  Bug: { Grass:2, Psychic:2, Dark:2, Steel:0.5, Fighting:0.5, Fire:0.5, Poison:0.5, Ghost:0.5, Flying:0.5 },
  Rock: { Fire:2, Ice:2, Bug:2, Flying:2, Steel:0.5, Fighting:0.5, Ground:0.5 },
  Ghost: { Psychic:2, Ghost:2, Dark:0.5, Normal:0 },
  Dragon: { Dragon:2, Steel:0.5 },
  Dark: { Psychic:2, Ghost:2, Fighting:0.5, Dark:0.5},
  Steel: { Ice:2, Rock:2, Steel:0.5, Water:0.5, Electric:0.5, Fire:0.5 },
  Fairy: {  }
};

// ---------- Utilitaires ----------
function getMultiplier(attacker, defender){
  const m = TYPE_CHART[attacker];
  if(!m) return 1;
  return m[defender] ?? 1;
}

function animateIn(el, opts = {}) {
  const { fromY = 12, fromX = 0, delay = 10, duration = 300 } = opts;
  el.style.opacity = '0';
  el.style.transform = `translate(${fromX}px, ${fromY}px)`;
  el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate(0,0)';
    }, delay);
  });
}

function pulseButton(btn){
  btn.style.transition = 'transform 140ms ease';
  btn.style.transform = 'scale(1.05)';
  setTimeout(() => btn.style.transform = 'scale(1)', 140);
}

// ---------- DOM helpers ----------
function clearAndFocus(container){
  container.innerHTML = '';
  container.scrollTop = 0;
}

function make(titleText){
  const el = document.createElement('div');
  el.className = 'center';
  el.innerHTML = `<h2>${titleText}</h2>`;
  return el;
}

// ---------- Création de la grille ----------
function createTypeGrid(container, onClick, small=false){
  const grid = document.createElement('div');
  grid.className = 'type-grid';
  if (small) grid.style.maxWidth = '480px';
  TYPES.forEach(t => {
    const cell = document.createElement('div');
    cell.className = `type-cell type-${t}` + (small ? ' small' : '');
    cell.textContent = t;
    cell.dataset.type = t;
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', (e) => {
      pulseButton(cell);
      onClick(t);
    });
    grid.appendChild(cell);
    animateIn(cell, { fromY: 8, delay: 15 * (TYPES.indexOf(t) % 6) });
  });
  container.appendChild(grid);
  animateIn(grid, { fromY: 10, delay: 0 });
}

// ---------- Affichage des résultats ----------
function showResults(parent, lists, modeLabel){
  clearAndFocus(parent);
  const wrapper = document.createElement('div');
  wrapper.className = 'result-row';

  function makePanel(title, items){
    const p = document.createElement('div');
    p.className = 'panel';
    p.style.opacity = '0';
    const h = document.createElement('h3'); h.textContent = title;
    p.appendChild(h);
    const g = document.createElement('div'); g.className = 'grid';
    items.forEach(it => {
      const pill = document.createElement('div');
      pill.className = `type-pill type-${it.type}`;
      pill.innerHTML = `<span>${it.type}</span><span class='mult'>${it.mult}</span>`;
      g.appendChild(pill);
    });
    p.appendChild(g);
    return p;
  }

  const p1 = makePanel('Super Effective (x2 or x4)', lists.forces);
  const p2 = makePanel('Not very effective/Immune (x0, x0.25, x0.5)', lists.weaknesses);
  const p3 = makePanel('Neutral (x1)', lists.neutral);

  wrapper.appendChild(p1);
  wrapper.appendChild(p2);
  wrapper.appendChild(p3);

  parent.appendChild(wrapper);

  [p1,p2,p3].forEach((p, i) => {
    setTimeout(() => animateIn(p, { fromX: 14, duration: 360 }), i * 90);
  });
}

// ---------- Bouton Back ----------
function addBackButton(container){
  const old = document.getElementById('back-btn');
  if(old) old.remove();
  const btn = document.createElement('button');
  btn.id = 'back-btn';
  btn.textContent = 'Back';
  btn.addEventListener('click', () => {
    const app = document.getElementById('app');
    if(app) attackMode(app);
  });
  container.appendChild(btn);
}

// ---------- Modes ----------
function attackMode(root){
  clearAndFocus(root);
  root.appendChild(make('Attack Mode — Choose an Attacking Type'));
  createTypeGrid(root, (type) => {
    const forces = [], weaknesses = [], neutral = [];
    TYPES.forEach(def => {
      const m = getMultiplier(type, def);
      if(m === 2) forces.push({type:def, mult:'x2'});
      else if(m === 0.5) weaknesses.push({type:def, mult:'x0.5'});
      else if(m === 0) weaknesses.push({type:def, mult:'x0'});
      else neutral.push({type:def, mult:'x1'});
    });
    showResults(root, {forces, weaknesses, neutral}, 'attaque');
    addBackButton(root);
  });
  addBackButton(root);
}

function defenseSingleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Defense Mode (1 type) — Choose a Defender Type'));
  createTypeGrid(root, (type) => {
    const forces = [], weaknesses = [], neutral = [];
    TYPES.forEach(att => {
      const m = getMultiplier(att, type);
      if(m === 2) forces.push({type:att, mult:'x2'});
      else if(m === 0 || m === 0.5) weaknesses.push({type:att, mult: m===0 ? 'x0' : 'x0.5'});
      else neutral.push({type:att, mult:'x1'});
    });
    showResults(root, {forces, weaknesses, neutral}, 'defense-single');
    addBackButton(root);
  });
}

function defenseDoubleMode(root){
  clearAndFocus(root);
  root.appendChild(make('Defense Mode (2 types) — Select the first type'));
  createTypeGrid(root, (first) => {
    clearAndFocus(root);

    const info = document.createElement('div'); 
    info.className='center';
    info.innerHTML = `<h2>Choose the second type (1st: ${first})</h2>`;
    root.appendChild(info);

    const grid = document.createElement('div');
    grid.className = 'type-grid';

    TYPES.forEach(t => {
      const cell = document.createElement('div');
      cell.className = `type-cell type-${t}`;
      cell.textContent = t;
      cell.dataset.type = t;

      if(t === first){
        // Style pour indiquer que ce type est déjà choisi
        cell.style.backgroundColor = 'white';
        cell.style.color = 'black';
        cell.style.cursor = 'not-allowed';
      } else {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
          pulseButton(cell);

          const forces = [], weaknesses = [], neutral = [];
          TYPES.forEach(att => {
            const m1 = getMultiplier(att, first);
            const m2 = getMultiplier(att, t);
            const mult = +(m1 * m2);

            if(mult === 2 || mult === 4){
              forces.push({type:att, mult: mult===4 ? 'x4' : 'x2'});
            } else if(mult === 0 || mult === 0.5 || mult === 0.25){
              let label = mult === 0 ? 'x0' : mult === 0.5 ? 'x0.5' : 'x0.25';
              weaknesses.push({type:att, mult:label});
            } else {
              neutral.push({type:att, mult:'x1'});
            }
          });

          showResults(root, {forces, weaknesses, neutral}, 'defense-double');
          addBackButton(root);
        });
      }

      grid.appendChild(cell);
      animateIn(cell, { fromY: 8, delay: 15 * (TYPES.indexOf(t) % 6) });
    });

    root.appendChild(grid);
    addBackButton(root);
  });
}


// ---------- Initial wiring ----------
window.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attack-btn');
  const defenseBtn = document.getElementById('defense-btn');
  const app = document.getElementById('app');

  if(!attackBtn || !defenseBtn || !app){
    console.error('Éléments manquants dans le HTML : vérifiez les IDs attack-btn, defense-btn, app');
    return;
  }

  attackBtn.addEventListener('click', (e) => { pulseButton(attackBtn); attackMode(app); });
  defenseBtn.addEventListener('click', (e) => {
    pulseButton(defenseBtn);
    app.innerHTML = '';
    const c = document.createElement('div'); c.className='center';
    c.innerHTML = '<h2>Defense Mode — Choose 1 or 2 types</h2>';
    app.appendChild(c);
    const controls = document.createElement('div'); controls.className='controls';
    const single = document.createElement('button'); single.className='small-btn'; single.textContent='One type only';
    const two = document.createElement('button'); two.className='small-btn'; two.textContent='Two types';
    controls.appendChild(single); controls.appendChild(two);
    app.appendChild(controls);

    single.addEventListener('click', (ev) => { pulseButton(single); defenseSingleMode(app); });
    two.addEventListener('click', (ev) => { pulseButton(two); defenseDoubleMode(app); });

    animateIn(controls, { fromY: 8 });
  });

  // auto-open attaque par défaut
  attackMode(app);
});
