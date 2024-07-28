#bin/bash

rm -rf dist;
npm run build:nostr;
npm run build:credential;

cd ./dist/;
chmod 777 -R dist;

tar -czvf ./nostr-ngx.tar.gz ./nostr-ngx/**;
tar -czvf ./nostr-credential-ngx.tar.gz ./nostr-credential-ngx/**;
cd ..;

chmod 777 -R dist;