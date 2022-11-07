import { Firestore } from '@google-cloud/firestore';
import { instanceToPlain } from 'class-transformer';
import fetch from 'node-fetch';

import { WoWCombatLogParser, WowVersion, IArenaMatch, IShuffleMatch } from '@wowarenalogs/parser';
import { createStubDTOFromArenaMatch, createStubDTOFromShuffleMatch } from './createMatchStub';

const matchStubsFirestore = process.env.ENV_MATCH_STUBS_FIRESTORE;
const stage: string = process.env.ENV_STAGE || 'dev';

const firestore = new Firestore({
  ignoreUndefinedProperties: true,
});

type ParseResult = {
  arenaMatches: IArenaMatch[];
  shuffleMatches: IShuffleMatch[];
};

export function parseFromStringArrayAsync(buffer: string[], wowVersion: WowVersion): Promise<ParseResult> {
  return new Promise((resolve) => {
    const logParser = new WoWCombatLogParser(wowVersion);

    const results: ParseResult = {
      arenaMatches: [],
      shuffleMatches: [],
    };

    logParser.on('arena_match_ended', (data: IArenaMatch) => {
      results.arenaMatches.push(data);
    });

    logParser.on('solo_shuffle_ended', (data: IShuffleMatch) => {
      results.shuffleMatches.push(data);
    });

    for (const line of buffer) {
      logParser.parseLine(line);
    }
    logParser.flush();

    resolve(results);
  });
}

// In the Google code they actually type file as `data:{}`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(file: any, context: any) {
  const fileUrl = `https://storage.googleapis.com/${file.bucket}/${file.name}`;

  console.log(`Opening ${fileUrl}`);
  const response = await fetch(fileUrl);
  const textBuffer = await response.text();

  const ownerId = response.headers.get('x-goog-meta-ownerid') || '';
  const wowVersion = (response.headers.get('x-goog-meta-wow-version') || 'retail') as WowVersion;
  const startTimeUTC = response.headers.get('x-goog-meta-starttime-utc');

  console.log(`Reading file: ${response.status} ${textBuffer.slice(0, 50)}`);
  const parseResults = await parseFromStringArrayAsync(textBuffer.split('\n'), wowVersion);
  console.log(
    `Parsed arenaMatchesLength=${parseResults.arenaMatches.length} shuffleMatchesLength=${parseResults.shuffleMatches.length}`,
  );
  const logObjectUrl = fileUrl;

  if (parseResults.arenaMatches.length > 0) {
    const arenaMatch = parseResults.arenaMatches[0];
    const stub = createStubDTOFromArenaMatch(arenaMatch, ownerId, logObjectUrl);
    if (startTimeUTC) {
      // Write the start time based on client-side headers to account for timezone differences
      stub.startTime = parseFloat(startTimeUTC);
      stub.utcCorrected = true;
    }
    const document = firestore.doc(`${matchStubsFirestore}/${stub['id']}`);
    await document.set(instanceToPlain(stub));
    return;
  }

  if (parseResults.shuffleMatches.length > 0) {
    const shuffleMatch = parseResults.shuffleMatches[0];
    const stubs = createStubDTOFromShuffleMatch(shuffleMatch, ownerId, logObjectUrl);
    stubs.forEach((stub) => {
      if (startTimeUTC) {
        stub.startTime = parseFloat(startTimeUTC);
        stub.utcCorrected = true;
      }
    });

    const promises = stubs.map((stub) => async () => {
      const document = firestore.doc(`${matchStubsFirestore}/${stub['id']}`);
      await document.set(instanceToPlain(stub));
    });

    await Promise.all(promises);
    return;
  }
  console.log('Parser did not find useable matches');
}

exports.handler = handler;
