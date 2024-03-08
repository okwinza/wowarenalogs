/*
A set of static data from the /data/wow/connected-realm/index api
*/

export const bnetLocales = [
  'en-us',
  'de-de',
  'en-gb',
  'es-es',
  'es-mx',
  'fr-fr',
  'it-it',
  'pt-br',
  'pt-pt',
  'ru-ru',
  'ko-kr',
  'zh-tw',
  'zh-cn',
];

const US_CONNECTED_REALM_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 47, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65,
  66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94,
  95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
  119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 151, 153, 154, 155, 156, 157, 158, 159, 160, 162,
  163, 164, 1067, 1068, 1069, 1070, 1071, 1072, 1075, 1128, 1129, 1130, 1131, 1132, 1136, 1137, 1138, 1139, 1140, 1141,
  1142, 1143, 1145, 1146, 1147, 1148, 1151, 1154, 1165, 1168, 1171, 1173, 1175, 1182, 1184, 1185, 1190, 1258, 1259,
  1260, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1270, 1271, 1276, 1277, 1278, 1280, 1282, 1283, 1284, 1285, 1286,
  1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1342, 1344, 1345, 1346, 1347, 1348, 1349, 1350,
  1351, 1352, 1353, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361, 1362, 1363, 1364, 1365, 1367, 1368, 1369, 1370,
  1371, 1372, 1373, 1374, 1375, 1377, 1425, 1426, 1427, 1428, 1549, 1555, 1556, 1557, 1558, 1559, 1563, 1564, 1565,
  1566, 1567, 1570, 1572, 1576, 1578, 1579, 1581, 1582, 3207, 3208, 3209, 3210, 3234, 3661, 3675, 3676, 3678, 3683,
  3684, 3685, 3693, 3694, 3721, 3722, 3723, 3724, 3725, 3726, 3733, 3734, 3735, 3736, 3737, 3738,
];

const KR_CONNECTED_REALM_IDS = [205, 210, 214, 2116];

const TW_CONNECTED_REALM_IDS = [963, 966, 980];

const EU_CONNECTED_REALM_IDS = [
  500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 515, 516, 517, 518, 519, 521, 522, 523, 524,
  525, 526, 527, 528, 529, 531, 533, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550,
  551, 552, 553, 554, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574,
  575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 600, 601, 602,
  604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 621, 622, 623, 624, 625, 626, 627,
  628, 629, 630, 631, 632, 633, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 1080, 1081, 1082, 1083,
  1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093, 1096, 1097, 1098, 1099, 1104, 1105, 1106, 1117, 1118,
  1119, 1121, 1122, 1123, 1127, 1298, 1299, 1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311,
  1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1327, 1328, 1329, 1330,
  1331, 1332, 1333, 1334, 1335, 1336, 1337, 1378, 1379, 1380, 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389,
  1390, 1391, 1392, 1393, 1394, 1395, 1396, 1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408, 1409, 1413, 1415,
  1416, 1417, 1587, 1588, 1589, 1595, 1596, 1597, 1598, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609, 1610, 1611,
  1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1922, 1923, 1924, 1925,
  1926, 1927, 1928, 1929, 2073, 2074, 3391, 3656, 3657, 3666, 3674, 3679, 3681, 3682, 3686, 3690, 3691, 3692, 3696,
  3702, 3703, 3713,
];

export function realmIdToRegion(realmId: number | string) {
  if (typeof realmId === 'string') {
    realmId = parseInt(realmId);
  }
  if (US_CONNECTED_REALM_IDS.includes(realmId)) {
    return 'us';
  }
  if (EU_CONNECTED_REALM_IDS.includes(realmId)) {
    return 'eu';
  }
  if (TW_CONNECTED_REALM_IDS.includes(realmId)) {
    return 'tw';
  }
  if (KR_CONNECTED_REALM_IDS.includes(realmId)) {
    return 'kr';
  }
  return 'def';
}
