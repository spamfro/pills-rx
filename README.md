# Pills Rx

## Run the app locally

### Install live certificates
```
openssl enc -aes-128-cbc -pbkdf2 -salt -d -in ~/ws-archive/certs.tar.gz.enc | tar xzv
```
### Start web server in Docker
```
docker container run --rm \
  --name node-app \
  --network bridge-dev \
  --ip 172.20.0.100 \
  --user node \
  --workdir /home/node/pills-rx \
  --volume "$PWD:/home/node/pills-rx" \
  --publish 3443:3443 \
  -it node bash
  
npm install
npm run dev -- --host 172.20.0.100 --port 3443
```
Open site at https://xps.spamfro.site:3443 (in LAN) or https://local.spamfro.site:3443 (via proxy: `ssh -L 3443:172.20.0.100:3443 xps`)
