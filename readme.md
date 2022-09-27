
## Commands to deploy the app on a production VM

``` bash
export DC_PATH='~/docker-compose'
./manage.sh up prod
```
## Troubleshooting solutions
1. `docker volume rm misc_site_node_modules`
2. `git pull --recurse-submodules`


## Application hostname 
https://213.166.43.12/
https://213-166-43-12.sslip.io/
https://aqua-d5a62b0c.nip.io

The user is able to download tiff files of a number of interest variables:
	Dry weight (per volume, per length of line, per unit area)
	Full weight(per volume, per length of line, per unit area)
	Kcal per unit area
	Protein weight per unit area
	Biomass CO2 per volume
	CO2 uptake per unit area

```
docker-compose -f ./misc/proxy.docker-compose.yml -f ./misc/prod.dashboard.docker-compose.yml -f ./misc/prod.site.docker-compose.yml --env-file=./misc/sim.env up --build -d acsite
```
