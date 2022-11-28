interface IZoneMetadata {
  id: string;
  name: string;
  imageWidth: number;
  imageHeight: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const zoneMetadata: Record<string, IZoneMetadata> = {
  '2547': {
    // TODO: Fix values
    id: '2547',
    name: 'Enigma Crucible',
    imageWidth: 500,
    imageHeight: 500,
    minX: -2000,
    minY: 7000,
    maxX: -2000,
    maxY: 7000,
  },
  '1505': {
    id: '1505',
    name: 'Nagrand Arena',
    imageWidth: 465,
    imageHeight: 495,
    minX: -2091,
    minY: 6605,
    maxX: -1998,
    maxY: 6704,
  },
  '1825': {
    id: '1825',
    name: 'Hook Point',
    imageWidth: 435,
    imageHeight: 385,
    minX: 965,
    minY: -369,
    maxX: 1052,
    maxY: -292,
  },
  '2167': {
    id: '2167',
    name: 'The Robodrome',
    imageWidth: 910,
    imageHeight: 480,
    minX: -372,
    minY: -328,
    maxX: -190,
    maxY: -232,
  },
  '1911': {
    id: '1911',
    name: 'Mugambala',
    imageWidth: 530,
    imageHeight: 585,
    minX: -1994,
    minY: 1237,
    maxX: -1888,
    maxY: 1354,
  },
  '1552': {
    id: '1552',
    name: "Ashamane's Fall",
    imageWidth: 515,
    imageHeight: 540,
    minX: 3500,
    minY: 5478,
    maxX: 3603,
    maxY: 5586,
  },
  '1504': {
    id: '1504',
    name: 'Black Rook Hold Arena',
    imageWidth: 505,
    imageHeight: 480,
    minX: 1366,
    minY: 1190,
    maxX: 1467,
    maxY: 1286,
  },
  '980': {
    id: '980',
    name: "Tol'Viron Arena",
    imageWidth: 635,
    imageHeight: 520,
    minX: -10781,
    minY: 379,
    maxX: -10654,
    maxY: 483,
  },
  '1134': {
    id: '1134',
    name: "Tiger's Peak",
    imageWidth: 700,
    imageHeight: 560,
    minX: 495,
    minY: 573,
    maxX: 635,
    maxY: 685,
  },
  '572': {
    id: '572',
    name: 'Ruins of Lordaeron',
    imageWidth: 475,
    imageHeight: 810,
    minX: 1239,
    minY: 1580,
    maxX: 1334,
    maxY: 1742,
  },
  '617': {
    id: '617',
    name: 'Dalaran Sewers',
    imageWidth: 620,
    imageHeight: 460,
    minX: 1227,
    minY: 744,
    maxX: 1351,
    maxY: 836,
  },
  '1672': {
    id: '1672',
    name: "Blade's Edge Arena",
    imageWidth: 505,
    imageHeight: 550,
    minX: 2732,
    minY: 5951,
    maxX: 2833,
    maxY: 6061,
  },
  '2373': {
    id: '2373',
    name: 'Empyrean Domain',
    imageWidth: 600,
    imageHeight: 585,
    minX: -1307,
    minY: 669,
    maxX: -1187,
    maxY: 786,
  },
};
