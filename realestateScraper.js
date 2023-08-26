import puppeteer from "puppeteer";

async function scrapeRealEstateData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const pricing_target_values = [
    "pricing-incicative-price",
    "pricing-total-price",
    "pricing-registration-charge",
    "pricing-joint-debt",
    "pricing-common-monthly-cost",
    "pricing-collective-assets",
    "pricing-municipal-fees",
    "pricing-tax-value",
  ];

  const info_target_values = [
    "info-property-type",
    "info-ownership-type",
    "info-primary-area",
    "info-usable-area",
    "info-floor",
    "info-construction-year",
    "energy-label",
    "info-plot-area",
  ];

  const dataTestIds = pricing_target_values.concat(info_target_values);

  const extractedData = await page.evaluate((dataTestIds) => {
    const extractedData = {};

    dataTestIds.forEach((dataTestId) => {
      const divElement = document.querySelector(
        `div[data-testid="${dataTestId}"]`
      );

      if (divElement) {
        const firstChildText = divElement.firstChild.textContent.trim();
        const lastChildText = divElement.lastChild.textContent.trim();

        extractedData[firstChildText] = lastChildText;
      }
    });

    const adress = document.querySelector('span[data-testid="object-address"]').textContent.trim();
    extractedData["Adresse"] = adress;

    return extractedData;
  }, dataTestIds);

  await browser.close();

  await m2Pris(extractedData);
  await addLink(extractedData, url);

  return extractedData;
}


function m2Pris(object) {
  // ADD regex to parseFloat()
  const m2Data = parseFloat(object["Primærrom"].match(/\d+/)[0]);
  const totalPrisData = parseFloat(
    object["Totalpris"].replace(/\s/g, "").replace("kr", "")
  );
  const m2Pris = Math.round(totalPrisData / m2Data);
  const formattedM2Pris = m2Pris.toLocaleString("nb-NO") + " kr";

  object["M2-Pris"] = formattedM2Pris;
  return object;
}

function addLink(object, url) {
  object["Link"] = url;
  return object
}


export async function runRealEstateScraper(url) {
  try {
    const results = await scrapeRealEstateData(url);
    console.log(results);
    return results;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
