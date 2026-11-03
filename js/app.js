const sizes = ['14','12','10','8','6','4','3','2','1','1/0','2/0','3/0','4/0','250','300','350','400','500','600','700','750'];

const ampacity = {
  copper: {
    60: [15,20,30,40,55,70,85,95,110,125,145,165,195,215,240,260,280,320,350,385,400],
    75: [20,25,35,50,65,85,100,115,130,150,175,200,230,255,285,310,335,380,420,460,475],
    90: [25,30,40,55,75,95,115,130,145,170,195,225,260,290,320,350,380,430,475,520,535]
  },
  aluminum: {
    60: [null,15,25,35,40,55,65,75,85,100,115,130,150,170,195,210,225,260,285,315,320],
    75: [null,20,30,40,50,65,75,90,100,120,135,155,180,205,230,250,270,310,340,375,385],
    90: [null,25,35,45,55,75,85,100,115,135,150,175,205,230,260,280,305,350,385,425,435]
  }
};

const egcTable = [
  { max: 15, cu: '14', al: '12' },
  { max: 20, cu: '12', al: '10' },
  { max: 60, cu: '10', al: '8' },
  { max: 100, cu: '8', al: '6' },
  { max: 200, cu: '6', al: '4' },
  { max: 300, cu: '4', al: '2' },
  { max: 400, cu: '3', al: '1' },
  { max: 500, cu: '2', al: '1/0' },
  { max: 600, cu: '1', al: '2/0' },
  { max: 800, cu: '1/0', al: '3/0' },
  { max: 1000, cu: '2/0', al: '4/0' },
  { max: 1200, cu: '3/0', al: '250' },
  { max: 1600, cu: '4/0', al: '350' },
  { max: 2000, cu: '250', al: '400' },
  { max: 2500, cu: '350', al: '600' },
  { max: 3000, cu: '400', al: '600' },
  { max: 4000, cu: '500', al: '750' },
  { max: 5000, cu: '700', al: '1200' },
  { max: 6000, cu: '800', al: '1200' }
];

const tradeSizes = ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '3-1/2"', '4"'];

const conduitFill = {
  '14':  [12,22,35,61,84,138,241,364,476,608],
  '12':  [9,16,26,45,61,101,176,266,347,443],
  '10':  [5,10,16,28,38,63,111,167,219,279],
  '8':   [3,6,9,16,22,36,64,96,126,161],
  '6':   [2,4,7,12,16,26,46,69,91,116],
  '4':   [1,2,4,7,10,16,28,43,56,71],
  '3':   [1,1,3,6,8,13,24,36,47,60],
  '2':   [1,1,3,5,7,11,20,30,40,51],
  '1':   [1,1,1,4,5,8,15,22,29,37],
  '1/0': [1,1,1,3,4,7,12,19,25,32],
  '2/0': [0,1,1,2,3,6,10,16,20,26],
  '3/0': [0,0,1,1,3,5,8,13,17,22],
  '4/0': [0,0,1,1,2,4,7,11,14,18],
  '250': [0,0,0,1,1,3,6,9,11,15],
  '300': [0,0,0,1,1,3,5,7,10,13],
  '350': [0,0,0,1,1,2,4,6,9,11],
  '400': [0,0,0,0,1,1,4,6,8,10],
  '500': [0,0,0,0,1,1,3,5,6,8],
  '600': [0,0,0,0,1,1,2,4,5,7],
  '700': [0,0,0,0,1,1,2,3,4,5],
  '750': [0,0,0,0,0,1,1,3,4,5]
};

function sizeIndex(size) {
  return sizes.indexOf(size);
}

function findWireSize(amps, material, temp) {
  const ampsArr = ampacity[material][temp];
  for (let i = 0; i < sizes.length; i++) {
    const amp = ampsArr[i];
    if (amp === null) continue;
    if (sizes[i] === '14' && amps > 15) continue;
    if (sizes[i] === '12' && amps > 20) continue;
    if (sizes[i] === '10' && amps > 30) continue;
    if (amp >= amps) {
      return { size: sizes[i], ampacity: amp };
    }
  }
  return null;
}

function findEGC(amps, material) {
  for (const entry of egcTable) {
    if (amps <= entry.max) {
      return material === 'copper' ? entry.cu : entry.al;
    }
  }
  return 'See Table 250.122';
}

function findGEC(phaseSize, material) {
  const idx = sizeIndex(phaseSize);
  if (idx === -1) return 'Unknown';
  if (material === 'copper') {
    if (idx <= sizeIndex('2')) return '8';
    if (idx <= sizeIndex('1/0')) return '6';
    if (idx <= sizeIndex('3/0')) return '4';
    if (idx <= sizeIndex('350')) return '2';
    if (idx <= sizeIndex('600')) return '1/0';
    if (idx <= sizeIndex('750')) return '2/0';
    return '3/0';
  } else {
    if (idx <= sizeIndex('1/0')) return '6';
    if (idx <= sizeIndex('3/0')) return '4';
    if (idx <= sizeIndex('250')) return '2';
    if (idx <= sizeIndex('500')) return '1/0';
    if (idx <= sizeIndex('750')) return '3/0';
    return '4/0';
  }
}

function findConduit(wireSize, num) {
  const fills = conduitFill[wireSize];
  if (!fills) return 'Not in table';
  for (let i = 0; i < fills.length; i++) {
    if (fills[i] >= num) {
      return tradeSizes[i];
    }
  }
  return 'Larger than 4" or use parallel';
}

function renderResults(data) {
  const el = document.getElementById('results');
  el.classList.remove('hidden');
  el.innerHTML = '';

  if (!data.wire) {
    el.innerHTML = `
      <div class="result-card warning">
        <h3>No Suitable Size</h3>
        <div class="value">Not found</div>
        <div class="detail">Check amperage or consider parallel conductors.</div>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="result-card">
      <h3>Phase Conductor</h3>
      <div class="value">${data.wire.size} AWG/kcmil</div>
      <div class="detail">${data.materialLabel} · ${data.temp}°C · Ampacity ${data.wire.ampacity} A</div>
    </div>
    <div class="result-card">
      <h3>${data.groundType}</h3>
      <div class="value">${data.groundSize} AWG/kcmil</div>
      <div class="detail">${data.materialLabel}</div>
    </div>
    <div class="result-card">
      <h3>Minimum Conduit</h3>
      <div class="value">${data.conduit}</div>
      <div class="detail">For ${data.numCond} conductors of ${data.wire.size}</div>
    </div>
    ${data.warning ? `<div class="result-card warning"><h3>Note</h3><div class="detail">${data.warning}</div></div>` : ''}
  `;
}

document.getElementById('calcForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const amps = parseInt(document.getElementById('amps').value, 10);
  const material = document.getElementById('material').value;
  const temp = document.getElementById('temp').value;
  const isService = document.getElementById('isService').value === 'yes';
  const numCond = parseInt(document.getElementById('numConductors').value, 10);

  const materialLabel = material === 'copper' ? 'Copper' : 'Aluminum';

  const wire = findWireSize(amps, material, temp);

  let groundSize, groundType;
  if (isService && wire) {
    groundSize = findGEC(wire.size, material);
    groundType = 'Grounding Electrode Conductor';
  } else {
    groundSize = findEGC(amps, material);
    groundType = 'Equipment Grounding Conductor';
  }

  const conduit = wire ? findConduit(wire.size, numCond) : '—';

  let warning = '';
  if (wire && ['600','700','750'].includes(wire.size)) {
    warning = 'Large conductors (600 kcmil+) may be difficult to pull. Consider parallel smaller conductors.';
  }

  renderResults({
    wire,
    materialLabel,
    temp,
    groundSize,
    groundType,
    conduit,
    numCond,
    warning
  });
});
