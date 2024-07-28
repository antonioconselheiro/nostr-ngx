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