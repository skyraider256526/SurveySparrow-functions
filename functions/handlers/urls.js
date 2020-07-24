const { db } = require('../util/admin');
///! ADD URL

const shortUrl = (string, id) => {
  let resStr = '',
    resId = '';
  const uniqueStr = [...new Set(string)];
  const uniqueStrLen = uniqueStr.length;
  const uniqueId = [...new Set(id)];
  const uniqueIdLen = uniqueId.length;
  if (uniqueStr.length < 3) return undefined;
  while (resStr.length < 3) {
    let pos = Math.floor(Math.random() * uniqueStrLen);
    if (!resStr.includes(uniqueStr[pos])) resStr += uniqueStr[pos];
  }
  while (resId.length < 4) {
    let pos = Math.floor(Math.random() * uniqueIdLen);
    if (!resId.includes(uniqueId[pos])) resId += uniqueId[pos];
  }
  return resStr + resId;
};

exports.addUrl = (request, response) => {
  db.collection(`urls/${request.user.uid}/urls/`)
    .add({
      originalUrl: request.body.url,
    })
    .then(doc => {
      doc.set(
        { shortUrl: shortUrl(request.body.url, doc.id) },
        { merge: true }
      );
    })
    // .create({ shortUrl: 'testseeee' })
    .then(() => response.status(201).json({ message: 'Url stored' }))
    .catch(err => {
      console.error(err);
      response.status(500).json(err);
    });
};

///! ADD URL
