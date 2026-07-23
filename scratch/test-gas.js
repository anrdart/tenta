const url = "https://script.google.com/macros/s/AKfycbxmpz859pzYecevzh8xPxBdzqhK4ycjlyCB-LawgMbNf8MdNU47bHdbldQcZRMbxBMT/exec";

// A minimal valid base64 image (1x1 pixel transparent gif)
const base64Gif = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: JSON.stringify({
    platform: "google",
    email: "test3@test.com",
    website: "https://test3.com",
    sosmed: "@test3",
    fileData: base64Gif,
    fileName: "test.gif",
    mimeType: "image/gif"
  })
}).then(res => res.text()).then(text => console.log(text)).catch(err => console.error(err));
