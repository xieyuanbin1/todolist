/* 四象限待办 · Service Worker
   策略：安装时把外壳缓存；请求先走缓存，缓存没有再上网并回写缓存。
   数据本身存 localStorage，不经过这里。换版本时改 CACHE 名字即可。 */
var CACHE = 'siwei-todo-v1';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon-48.png',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 逐条 add，单个文件 404 不会把整个安装搞挂
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // 导航请求：优先缓存里的外壳，保证断网能打开；有网时后台更新
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(function (hit) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) {
            caches.open(CACHE).then(function (c) { c.put('./index.html', res.clone()); });
          }
          return res;
        }).catch(function () { return hit; });
        return hit || fresh;
      })
    );
    return;
  }

  // 静态资源：缓存优先，缺了再上网回写
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && new URL(req.url).origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
