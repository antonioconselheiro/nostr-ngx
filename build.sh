#bin/bash

rm -rf dist;
npm run build:nostr;
npm run build:credential;

cd ./dist/nostr-ngx;
npm pack;

cd ../nostr-credential-ngx;
npm pack;

cd ../..;
chmod 777 -R dist;
mv ./dist/nostr-credential-ngx/belomonte-nostr-credential-ngx-0.0.1.tgz ./dist/belomonte-nostr-credential-ngx-0.0.1.tgz
mv ./dist/nostr-ngx/belomonte-nostr-ngx-0.0.1.tgz ./dist/belomonte-nostr-ngx-0.0.1.tgz