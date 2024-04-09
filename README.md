# Pills Rx

## Run the app locally

### Install live certificates
```
openssl enc -aes-128-cbc -pbkdf2 -salt -d -in ~/ws-archive/certs.tar.gz.enc | tar xzv
```
### Start node container
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
```

### Install dependencies
```bash
npm install
```

### Run with Vite dev server (option #1)
```bash
npm run dev -- --host 172.20.0.100 --port 3443
```

### Run distribution build (option #2)
```bash
npm run build
npx http-server ./dist -c-1 --ssl -a 172.20.0.100 -p 3443 --cert ./certs/cert.pem --key ./certs/cert-key-nopassword.pem
```
Open site at https://xps.spamfro.site:3443 (in LAN) or https://local.spamfro.site:3443 (via proxy: `ssh -L 3443:172.20.0.100:3443 xps`)
