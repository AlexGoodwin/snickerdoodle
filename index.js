const axios = require("axios");
const cheerio = require("cheerio");

const URLS = ["https://hudsonlee.bandcamp.com/album/headspaces"];

async function getPage(url, type = "bandcamp-album") {
  try {
    const response = await axios.get(url);
    return parseHtml(response.data);
  } catch (e) {
    throw e;
  }
}

function parseHtml(html) {
  const $ = cheerio.load(html);

  const description = $('meta[name="Description"]').attr("content");
  const secureUrl = $('meta[property="og:video:secure_url"]').attr("content");
  const releaseID = secureUrl.match(/album=(\d+)\//)[1];
  const releaseType = $('meta[property="og:type"]').attr("content");
  const albumArtFull = $('link[rel="image_src"]').attr("href");
  const url = $('meta[property="og:url"]').attr("content");
  const artistName = $('meta[property="og:site_name"]').attr("content");

  return {
    artistName,
    albumArtFull,
    description,
    releaseType,
    releaseID,
    url
  };
}

URLS.forEach(url => {
  getPage(url).then(result => console.log(result));
});
