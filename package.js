Package.onUse(function (api) {
  // If we are loading mongo-livedata, let you store ObjectIDs in it.
  api.use(['mongo', 'reload'], { weak: true });
  api.mainModule('migration.js');
  api.export('ReactiveDict');
});
