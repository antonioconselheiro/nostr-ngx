#bin/bash

rm -rf dist;
npm run build:nostr;
npm run build:gui;

cd ./dist/nostr-ngx;
npm pack;

cd ../nostr-gui-ngx;
npm pack;

cd ../..;
chmod 777 -R dist;
mv ./dist/nostr-gui-ngx/belomonte-nostr-gui-ngx-0.0.1.tgz ./dist/belomonte-nostr-gui-ngx-0.0.1.tgz
mv ./dist/nostr-ngx/belomonte-nostr-ngx-0.0.1.tgz ./dist/belomonte-nostr-ngx-0.0.1.tgz