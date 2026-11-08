// The only file you need to edit to connect the site to your Google Sheet.
window.CV_CONFIG = {
  // 1) Paste your Google Sheet ID here. It is the long part of the sheet's address:
  //    https://docs.google.com/spreadsheets/d/  THIS-PART  /edit
  //    The sheet must be shared as "Anyone with the link: Viewer".
  //    Leave it empty to show the built-in content from fallback.js.
  sheetId: "1UQjYKgKhFWDin3xmP0bVTu89DLc60q36R03U-9eqFzQ",

  // 2) Optional: if you prefer File > Share > Publish to web, paste one CSV link per tab here instead.
  //    Example: { works: "https://docs.google.com/spreadsheets/d/e/....../pub?gid=123&single=true&output=csv" }
  tabUrls: {},

  // Language shown to a first-time visitor: "th" or "en".
  defaultLang: "th",

  // Show Thai dates in the Buddhist era (พ.ศ.)? false = 2019, true = 2562.
  buddhistYear: false,

  // How many minutes a visitor's browser may reuse the last copy of the sheet before asking again.
  cacheMinutes: 5
};
