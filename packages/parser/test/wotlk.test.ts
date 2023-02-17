import { CombatResult, CombatUnitClass } from '../src/types';
import { LoaderResults, loadLogFile } from './testLogLoader';

/**
 * Tests for Classic files are defunct until we resume wow classic development
 */
describe('parsing a wotlk log file', () => {
  const results: LoaderResults = {
    combats: [],
    malformedCombats: [],
    shuffleRounds: [],
    shuffles: [],
  };

  beforeAll(() => {
    const loaded = loadLogFile('wotlk.txt');

    require('fs').writeFileSync('/tmp/wotlk.json', JSON.stringify(loaded, null, 2), 'utf8');
    results.combats = loaded.combats;
    results.malformedCombats = loaded.malformedCombats;
    results.shuffleRounds = loaded.shuffleRounds;
    results.shuffles = loaded.shuffles;
  });

  it('should return no malformed matches', () => {
    expect(results.malformedCombats).toHaveLength(0);
  });
  it('should return 2 matches', () => {
    expect(results.combats).toHaveLength(2);
  });

  it('should have 1 loss', () => {
    expect(results.combats.filter((c) => c.result === CombatResult.Lose)).toHaveLength(1);
  });
  it('should have 1 win', () => {
    expect(results.combats.filter((c) => c.result === CombatResult.Win)).toHaveLength(1);
  });
  it('should have the correct class inferred', () => {
    expect(Object.values(results.combats[0].units).filter((u) => u.name === 'Laral-Pagle')[0].class).toEqual(
      CombatUnitClass.Druid,
    );
    expect(results.combats[0].playerId).toBe('Player-4385-03BD0BFD');
  });

  it('should have the correct bracket inferred', () => {
    expect(results.combats[0].startInfo.bracket).toEqual('2v2');
  });
});
