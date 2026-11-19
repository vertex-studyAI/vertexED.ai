import assert from 'node:assert/strict';
import test from 'node:test';
import { EXAM_DRILLS } from '../src/content/examPractice.ts';
import { selectBaselineDrills } from '../src/lib/examBaselineCore.mjs';

const drill = (id) => {
  const item = EXAM_DRILLS.find((entry) => entry.id === id);
  assert.ok(item, id);
  return item;
};
const captured = (text, pattern) => {
  const match = text.match(pattern);
  assert.ok(match, String(pattern));
  return match.slice(1).map((value) => Number(value.replaceAll(',', '')));
};
const answerIncludes = (item, values) => {
  const numbers = (item.solution.replaceAll(',', '').match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  for (const value of values) assert.ok(numbers.some((number) => Math.abs(number - value) <= Math.max(1, Math.abs(value)) * 1e-10), `${item.id}: ${value}`);
};

test('Economics SL/HL baselines now find Economics drills and retain requested topic coverage', () => {
  for (const subject of ['Economics SL', 'Economics HL']) {
    const selected = selectBaselineDrills({ drills: EXAM_DRILLS, programme: 'IB DP', subject,
      topics: ['Externalities', 'Price controls', 'Environmental policy'] });
    assert.equal(selected.length, 3);
    assert.ok(selected.every((item) => item.programme === 'IB DP' && item.subject === 'Economics'));
    assert.deepEqual(new Set(selected.map((item) => item.topic)), new Set(['Externalities', 'Price controls', 'Environmental policy']));
  }
});

test('Physics thermal requests select calorimetry and phase-change content within the subject', () => {
  const selected = selectBaselineDrills({ drills: EXAM_DRILLS, programme: 'IB DP', subject: 'Physics HL',
    topics: ['Calorimetry', 'Phase change and latent heat', 'Thermal energy transfers'] });
  assert.equal(selected.length, 3);
  assert.ok(selected.every((item) => item.subject === 'Physics'));
  assert.deepEqual(new Set(selected.map((item) => item.topic)), new Set(['Calorimetry', 'Phase change and latent heat', 'Thermal energy transfers']));
});

test('externality numerical answers agree with the equations and external margins in their prompts', () => {
  const negativeProduction = drill('dp-econ-negative-production');
  const [demand] = captured(negativeProduction.prompt, /MPB = MSB = (\d+) − Q/);
  const [supply] = captured(negativeProduction.prompt, /MPC = (\d+) \+ Q/);
  const [harm] = captured(negativeProduction.prompt, /external cost of (\d+)/);
  const market = (demand - supply) / 2;
  const efficient = (demand - supply - harm) / 2;
  answerIncludes(negativeProduction, [market, demand - market, efficient, demand - efficient, supply + efficient, (market - efficient) * harm / 2]);

  const positiveConsumption = drill('dp-econ-positive-consumption');
  const [privateBenefit] = captured(positiveConsumption.prompt, /MPB = (\d+) − Q/);
  const [privateCost] = captured(positiveConsumption.prompt, /MPC = MSC = (\d+) \+ Q/);
  const [benefit] = captured(positiveConsumption.prompt, /external benefit of (\d+)/);
  const unregulated = (privateBenefit - privateCost) / 2;
  const optimum = (privateBenefit + benefit - privateCost) / 2;
  answerIncludes(positiveConsumption, [unregulated, optimum, privateBenefit - optimum, privateCost + optimum, benefit * optimum, (optimum - unregulated) * benefit / 2]);

  const negativeConsumption = drill('dp-econ-negative-consumption');
  const [mpb] = captured(negativeConsumption.prompt, /MPB = (\d+) − Q/);
  const [mpc] = captured(negativeConsumption.prompt, /MPC = MSC = (\d+) \+ Q/);
  const [externalHarm] = captured(negativeConsumption.prompt, /harm to other people worth (\d+)/);
  const quantity = (mpb - mpc) / 2;
  const socialQuantity = (mpb - externalHarm - mpc) / 2;
  answerIncludes(negativeConsumption, [mpb - externalHarm, quantity, socialQuantity, (quantity - socialQuantity) * externalHarm / 2]);
});

test('policy arithmetic uses emissions per output unit and distinguishes shortage from trades', () => {
  const carbon = drill('dp-econ-carbon-policy');
  const [rate] = captured(carbon.prompt, /charge is (\d+) currency/);
  const [original, cleaner] = captured(carbon.prompt, /emits ([\d.]+) tonnes.*emits ([\d.]+) tonnes/);
  answerIncludes(carbon, [rate * original, rate * cleaner, rate * (original - cleaner)]);

  const ceiling = drill('dp-econ-price-ceiling');
  const [a, b] = captured(ceiling.prompt, /Qd = (\d+) − (\d+)P/);
  const [c, d] = captured(ceiling.prompt, /Qs = (\d+) \+ (\d+)P/);
  const [maximum] = captured(ceiling.prompt, /ceiling of (\d+)/);
  const price = (a - c) / (b + d);
  answerIncludes(ceiling, [price, a - b * price, a - b * maximum, c + d * maximum, a - b * maximum - c - d * maximum]);
});

test('thermal numerical answers balance energy using the masses and temperatures in each prompt', () => {
  const warm = drill('dp-physics-thermal-energy');
  const [mass, initial, final] = captured(warm.prompt, /A ([\d.]+) kg.*from ([\d.]+) °C to ([\d.]+) °C/);
  const [specificHeat] = captured(warm.prompt, /c = (\d+) J/);
  const [power] = captured(warm.prompt, /ideal (\d+) W/);
  const energy = mass * specificHeat * (final - initial);
  answerIncludes(warm, [energy, energy / power]);

  const metal = drill('dp-physics-calorimetry-metal');
  const [metalMass, metalStart, waterMass, waterStart] = captured(metal.prompt, /A ([\d.]+) kg metal block at ([\d.]+) °C.*in ([\d.]+) kg of water at ([\d.]+) °C/);
  const [equilibrium] = captured(metal.prompt, /reach ([\d.]+) °C/);
  const [waterCapacity] = captured(metal.prompt, /capacity (\d+) J/);
  const waterGain = waterMass * waterCapacity * (equilibrium - waterStart);
  answerIncludes(metal, [waterGain, Number((waterGain / (metalMass * (metalStart - equilibrium))).toPrecision(3))]);

  const cup = drill('dp-physics-calorimeter');
  const [blockMass, blockStart, liquidMass, liquidStart] = captured(cup.prompt, /A ([\d.]+) kg metal block at ([\d.]+) °C.*in ([\d.]+) kg of water at ([\d.]+) °C/);
  const [cupCapacity] = captured(cup.prompt, /C = ([\d.]+) J/);
  const [end] = captured(cup.prompt, /final temperature is ([\d.]+) °C/);
  const [liquidCapacity] = captured(cup.prompt, /cwater = (\d+) J/);
  const liquidGain = liquidMass * liquidCapacity * (end - liquidStart);
  const cupGain = cupCapacity * (end - liquidStart);
  answerIncludes(cup, [liquidGain, cupGain, liquidGain + cupGain,
    Number(((liquidGain + cupGain) / (blockMass * (blockStart - end))).toPrecision(3)),
    liquidGain / (blockMass * (blockStart - end))]);

  const ice = drill('dp-physics-latent-heat');
  const [iceMass] = captured(ice.prompt, /melts ([\d.]+) kg/);
  const [waterEnd] = captured(ice.prompt, /water to ([\d.]+) °C/);
  const [latent] = captured(ice.prompt, /Lf = ([\d,]+) J/);
  const [waterC] = captured(ice.prompt, /c = (\d+) J/);
  const [heater] = captured(ice.prompt, /with a (\d+) W/);
  const melting = iceMass * latent;
  const heating = iceMass * waterC * waterEnd;
  answerIncludes(ice, [melting, heating, melting + heating, (melting + heating) / heater]);
});
