const axios = require("axios");
const cheerio = require("cheerio");

const upscaleUrl = "https://upscalehq.bandcamp.com/music";

const pageToAbsoluteUrl = (page_url, base) => base.replace("/music", page_url);

async function getAllBandcampArtistReleaseUrls(artistUrl) {
  const response = await axios.get(artistUrl);

  const $ = cheerio.load(response.data);

  const releaseData = $("ol.music-grid").attr("data-initial-values");
  const releases = JSON.parse(releaseData);

  return releases.map(release =>
    pageToAbsoluteUrl(release.page_url, artistUrl)
  );
}

async function getRelease(url) {
  try {
    const response = await axios.get(url);
    return getReleaseData(response.data);
  } catch (e) {
    throw e;
  }
}

function getReleaseData(html) {
  const $ = cheerio.load(html);

  const description = $('meta[name="Description"]')
    .attr("content")
    .trim();
  const releaseType = $('meta[property="og:type"]').attr("content");
  const albumArtFull = $('link[rel="image_src"]').attr("href");
  const url = $('meta[property="og:url"]').attr("content");
  const secureUrl = $('meta[property="og:video:secure_url"]').attr("content");

  const releaseIdRegex = new RegExp(
    `${releaseType == "album" ? "album" : "track"}=(\\d+)\/`
  );
  const releaseID = secureUrl.match(releaseIdRegex)[1];
  const artistRegex = new RegExp(".*\\ by\\ (.*)\\s*");
  const albumBcTitle = $('meta[property="og:title"]').attr("content");
  const artistMatch = albumBcTitle.match(artistRegex);
  const artistName = artistMatch[1];

  return {
    artistName,
    albumArtFull,
    description,
    releaseType,
    releaseID,
    url
  };
}

getAllBandcampArtistReleaseUrls(upscaleUrl).then(async urls => {
  const results = await Promise.all(
    urls.map(async url => {
      return await getRelease(url);
    })
  );
  console.log(JSON.stringify(results));
});
