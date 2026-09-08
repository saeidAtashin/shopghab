# TLS files for shopghab.ir (not committed)

Place Let's Encrypt PEMs here (already in `.gitignore` as `*.pem`):

- `fullchain.pem`
- `privkey.pem`

Copy onto the VPS, then run bootstrap:

```bash
ssh root@185.204.197.187 'mkdir -p /root/shopghab/deploy/ssl'
scp fullchain.pem root@185.204.197.187:/root/shopghab/deploy/ssl/fullchain.pem
scp privkey.pem root@185.204.197.187:/root/shopghab/deploy/ssl/privkey.pem
ssh root@185.204.197.187 'bash /root/shopghab/deploy/bootstrap-shopghab.sh'
```

The `.pfx` file is not used by nginx.
