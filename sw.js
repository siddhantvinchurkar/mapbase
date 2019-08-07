/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "firebase.json",
    "revision": "658cbc648f9a12fc61a9df94db85dd3c"
  },
  {
    "url": "firestore.indexes.json",
    "revision": "6c1369bcee45fa3baebaaf77f2dc3ae3"
  },
  {
    "url": "firestore.rules",
    "revision": "3aac628110fb74bea4608f89afacd9f2"
  },
  {
    "url": "functions/index.js",
    "revision": "10be3e3e7e0ea62663880569677cc5c1"
  },
  {
    "url": "functions/package-lock.json",
    "revision": "e8ff5dd24fa8ba29a6b02ff4f02b019b"
  },
  {
    "url": "functions/package.json",
    "revision": "cedaeab0e8fb016b2b8155d30c0f048f"
  },
  {
    "url": "index.html",
    "revision": "0aa7265208a9484e7e44266bbf3fc8be"
  },
  {
    "url": "README.md",
    "revision": "2e912c846ea65eadc683289e9e63e3ef"
  },
  {
    "url": "resources/images/earth.png",
    "revision": "1c1007dae70b6acab19a4c867e28a0d8"
  },
  {
    "url": "resources/images/icons/favicons/144.png",
    "revision": "656c5354985434d04f6559e7d7afc60c"
  },
  {
    "url": "resources/images/icons/favicons/192.png",
    "revision": "bd62dd5420bd7231f45758ac2c3eaed4"
  },
  {
    "url": "resources/images/icons/favicons/48.png",
    "revision": "fafd48e18298c571545d97650a6963c0"
  },
  {
    "url": "resources/images/icons/favicons/512.png",
    "revision": "66524a13434c1aaefb1316b67194a60d"
  },
  {
    "url": "resources/images/icons/favicons/72.png",
    "revision": "3ebaf7f55bfd0a4ea9071da7def5514b"
  },
  {
    "url": "resources/images/icons/favicons/96.png",
    "revision": "e12ec465ac3d36cc56ef74ffbb9e63ba"
  },
  {
    "url": "resources/images/icons/google.png",
    "revision": "1a722cd81d761043d3380106b64f2da2"
  },
  {
    "url": "resources/images/icons/location_blue.png",
    "revision": "c4e827959346ad7aa616313d3aff348b"
  },
  {
    "url": "resources/images/icons/location_green.png",
    "revision": "521758879abbae0c73a4dc805359e7cc"
  },
  {
    "url": "resources/images/icons/location_purple.png",
    "revision": "4522dbbac06d408627beead62948c874"
  },
  {
    "url": "resources/images/icons/location_red.png",
    "revision": "6fbbd74e05a4645cf6a95df3bdd92b9e"
  },
  {
    "url": "resources/images/icons/start_flag.png",
    "revision": "e8d0afda168bc6490ad5c76acd29748c"
  },
  {
    "url": "resources/scripts/ipr_cities.json",
    "revision": "2da89cb9c996bcbe7dc92aad785c0c4e"
  },
  {
    "url": "resources/scripts/main.js",
    "revision": "e26b37ee1c21975131bdf084c7274935"
  },
  {
    "url": "resources/scripts/manifest.json",
    "revision": "d7e0c4281b387698591dc3acd5e2d705"
  },
  {
    "url": "resources/styles/main.css",
    "revision": "0996fb42d548078ff87615948eb142f1"
  },
  {
    "url": "storage.rules",
    "revision": "307549de80ebee91ac86a65766bd6d25"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
