const { db } = require('../util/admin');
///! ADD URL

const getShortUrl = (string, id) => {
  let resStr = '',
    resId = '',
    urlRegEx = /^(?:https?|chrome):\/\/(?:w{0,3}\.)?([^\s$.?#]+).[^\s]*$/;
  const website = string.match(urlRegEx)[1];
  const uniqueStr = [...new Set(website)];
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
  const originalUrl = request.body.url;
  let shortUrl = '';
  db.collection(`urls/${request.user.uid}/urls/`)
    .add({
      originalUrl: originalUrl,
    })
    .then(doc => {
      shortUrl = getShortUrl(request.body.url, doc.id);
      doc.set({ shortUrl: shortUrl }, { merge: true });
      return response.status(201).json({ originalUrl, shortUrl });
    })
    // .create({ shortUrl: 'testseeee' })
    .catch(err => {
      console.error(err);
      response.status(500).json(err);
    });
};

///! ADD URL

///! Get urls
exports.getUrls = (request, response) => {
  console.log(request.user.uid);
  db.collection(`/urls/${request.user.uid}/urls`)
    .get()
    .then(doc => {
      console.log(doc.docs);
      let urls = [];
      doc.forEach(doc => {
        let newUrl = {
          ...doc.data(),
          id: doc.id,
        };
        urls.push(newUrl);
      });
      return response.status(201).json(urls);
    })
    .then(err => {
      console.log(err);
      return response.status(400).json({ general: 'Something went wrong' });
    });
};

///! Remove url

exports.deleteUrl = (request, response) => {
  console.log(request.params.id);
  db.collection(`/urls/${request.user.uid}/urls/`)
    .where('shortUrl', '==', request.params.id)
    /// this only returns one document
    .limit(1)
    .get()
    .then(docs => {
      docs.forEach(doc => {
        // so we can return
        return doc.ref.delete();
      });
    })
    .then(data => {
      return response.status(200).json({ general: `Url deleted on ` });
    })
    .catch(err => {
      console.log(err);
      return response.status(400).json({ general: 'Something went wrong' });
    });
};
