function fairPriceHouse(doorNumber = "42", postcode = "E15 3PJ") {
  var url = `https://landregistry.data.gov.uk/data/ppi/address.json?_page=0&paon=${doorNumber}&postcode=${postcode}`;

  console.log("url", url);

  var response = UrlFetchApp.fetch(url);
  console.log(response.getContentText());

  var properties = JSON.parse(response.getContentText()).result.items.filter(
    (e) => e.paon.includes(doorNumber)
  );

  console.log("properties", properties);

  if (properties?.length === 0) {
    return -1;
  }

  var house = properties[0];
  console.log("house", house);

  var regionName = house.district;

  var houseTransactions = [];

  properties.forEach((property) => {
    houseTransactions.push(...getTransactions(property));
  });

  var houseType = getHouseType(houseTransactions);

  var houseTransactionsMapped = mapTransactions(houseTransactions);

  var lastTransaction =
    houseTransactionsMapped[houseTransactionsMapped.length - 1];
  console.log("lastTransaction", lastTransaction);

  var lastTransactionMonth = getLastTransactionMonth(lastTransaction);
  var fairPrice = getFairPrice(
    regionName,
    lastTransactionMonth,
    houseType,
    lastTransaction
  );

  var out = [
    houseType,
    lastTransactionMonth,
    lastTransaction.pricePaid,
    fairPrice,
  ];
  console.log("out", out);
  return [out];
}

function getAccelerationInPrices(postcode = "E15 3PJ") {
  var url = `https://landregistry.data.gov.uk/data/ppi/address.json?_page=0&postcode=${postcode}`;
  console.log("url", url);

  var response = UrlFetchApp.fetch(url);
  console.log(response.getContentText());

  var properties = JSON.parse(response.getContentText()).result.items;

  console.log("properties", properties);

  if (properties?.length === 0) {
    return -1;
  }

  var houseTransactions = [];

  properties.forEach((property) => {
    houseTransactions.push(...getTransactions(property));
  });

  var houseTransactionsMapped = mapTransactions(houseTransactions);

  houseTransactionsMapped.map((t) => [t.transactionDate, t.pricePaid]);

  var out = [
    houseTransactionsMapped.map((t) => [t.transactionDate, t.pricePaid]),
  ];
  console.log("out", out);
  return houseTransactionsMapped.map((t) => [
    getLastTransactionMonth(t),
    t.transactionDate,
    t.pricePaid,
    t.propertyType,
  ]);
}

function getFairPrice(
  regionName,
  lastTransactionMonth,
  houseType,
  lastTransaction
) {
  var hpi = getHPIByRegion(regionName);

  // console.log("hpi", hpi)
  var larstTransactionHpiRaw = hpi.filter(
    (value) => value["ukhpi:refMonth"]["@value"] === lastTransactionMonth
  );

  // console.log("larstTransactionHpiRaw",larstTransactionHpiRaw)
  var larstTransactionHpi = larstTransactionHpiRaw.map((d) => {
    return {
      refMonth: d["ukhpi:refMonth"]["@value"],
      terraced: d["ukhpi:housePriceIndexTerraced"][0],
      "flat-maisonette": d["ukhpi:housePriceIndexFlatMaisonette"][0],
      "semi-detached": d["ukhpi:housePriceIndexSemiDetached"][0],
      detached: d["ukhpi:housePriceIndexDetached"][0],
    };
  })[0];

  console.log("larstTransactionHpi", larstTransactionHpi);

  var latestDataTransactionHpi = [hpi[hpi.length - 1]].map((d) => {
    return {
      refMonth: d["ukhpi:refMonth"]["@value"],
      terraced: d["ukhpi:housePriceIndexTerraced"][0],
      "flat-maisonette": d["ukhpi:housePriceIndexFlatMaisonette"][0],
      "semi-detached": d["ukhpi:housePriceIndexSemiDetached"][0],
      detached: d["ukhpi:housePriceIndexDetached"][0],
    };
  })[0];

  console.log("latestDataTransactionHpi", latestDataTransactionHpi);

  var lastTransactionHPI = larstTransactionHpi[houseType];
  var lastHPI = latestDataTransactionHpi[houseType];

  var increase = (lastHPI - lastTransactionHPI) / lastTransactionHPI;
  console.log("increase", increase);
  console.log("lastTransactionPrice", lastTransaction.pricePaid);
  var fairPrice = (increase + 1) * lastTransaction.pricePaid;
  return fairPrice;
}

function getLastTransactionMonth(lastTransaction) {
  var lastTransactionPrice = lastTransaction.pricePaid;
  var lastTransactionMonth = `${new Date(
    lastTransaction.transactionDate
  ).getFullYear()}-${`0${new Date(lastTransaction.transactionDate).getMonth()}`
    .replace("010", "10")
    .replace("011", "11")
    .replace("012", "12")}`;

  console.log(
    "new Date(lastTransaction.transactionDate)",
    new Date(lastTransaction.transactionDate)
  );
  console.log("lastTransactionMonth", lastTransactionMonth);
  return lastTransactionMonth;
}

function getHPIByRegion(regionName) {
  var url3 =
    `https://landregistry.data.gov.uk/app/ukhpi/download/new.json?from=1995-01-01&to=${
      new Date().getFullYear() + 1
    }-01-01&location=http://landregistry.data.gov.uk/id/region/${regionName.toLowerCase()}&thm[]=property_type&in[]=hpi`.replace(
      " ",
      "-"
    );

  console.log("url3", url3);
  var response3 = UrlFetchApp.fetch(url3);
  var hpi = JSON.parse(response3.getContentText()).items;
  return hpi;
}

function mapTransactions(houseTransactions) {
  var houseTransactionsMapped = houseTransactions
    .map((t) => {
      return {
        transactionDate: new Date(t.transactionDate).getTime(),
        pricePaid: t.pricePaid,
        propertyType: t.propertyType.label[0]._value,
      };
    })
    .sort(function (a, b) {
      return a.transactionDate - b.transactionDate;
    });

  console.log("houseTransactionsMapped", houseTransactionsMapped);
  return houseTransactionsMapped;
}

function getHouseType(houseTransactions) {
  var houseType =
    houseTransactions[houseTransactions.length - 1].propertyType.prefLabel[0]
      ._value;

  console.log("houseType", houseType);
  return houseType;
}

function getTransactions(house) {
  var url2 = `${house._about}/transactions.json`;
  console.log(url2);

  var response2 = UrlFetchApp.fetch(url2);
  var houseTransactions = JSON.parse(response2.getContentText()).result.items;

  console.log("houseTransactions", houseTransactions);
  return houseTransactions;
}
