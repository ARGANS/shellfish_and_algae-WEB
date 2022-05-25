## Overview:

This project depends on three repositories that need to be deployed to virtual machines:
1. Web Application;
2. Models and subprojects;
3. Application for running tasks/containers (task runner).

List of virtual machines that we use:
- VM10 10.27.54.10 - used to host the web application
- VM11 10.27.54.11 - used to execute tasks in containers

-----------------------------------------------------------------------------

## Web Application
The main application that provides access to the service.
[Github](https://github.com/ARGANS/shellfish_and_algae-WEB)

### When should I re-deploy the application to the VM?
Every time the source code in the repository is updated.

### Commands to deploy to your local computer
1. This repository includes submodules, so you should clone the repository with all submodules:
`git clone --recurse-submodules https://github.com/ARGANS/shellfish_and_algae-WEB.git`


2. Then you can deploy the application in development mode: `./manage.sh up dev`
2. If you have made any changes to the files in the `site/project` directory, you will need to rebuild the static site: `docker exec -it ac-site sh -c './build.sh'`

### Commands for deploying to the virtual machine
Necessary steps:
0. Install the current version of the docker-compose utility in your profile (the version installed by AdwiseEO is outdated):
``` SH
curl -SL https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-linux-x86_64 -o ~/docker-compose
chmod +x ~/docker-compose
```
1. You can upload the necessary source code to the VM using the command `./sync.sh `. This bash script loads the source codes into the `/profils/$USER/prj` directory on VM11.
2. You must connect via ssh to VM11 and go to the directory `/profils/$USER/prj`
3. Next, you must specify the path to the actual docker-compose utility file and run the bash script:
``` SH
export DC_PATH='~/docker-compose'
./manage.sh up prod
```
4. The site should be available at https://213.166.43.12/

### How to update the form using a json file

In case you need to update the form due to a change in the [macroalgae_model_parameters_input.json](https://github.com/ARGANS/shellfish_and_algae-MODEL/blob/main/macroalgae/macroalgae_model_parameters_input.json) file:

1. Update the contents of the file `site/project/models/macroalgae_model_parameters.json`;
2. After that, you need to deploy the application to the VM.

## Creating new users
1. You have to autorize as admin user at https://213.166.43.12/api/v1/admin/ with the following credentials:
login: site_admin
password: Aquaculture.2022
2. Fill out the form at https://213.166.43.12/api/v1/admin/users/


-----------------------------------------------------------------------------

## Models and subprojects
[Github](https://github.com/ARGANS/shellfish_and_algae-MODEL.git)

### Commands for updating images on VM11

If you have changed the source code, you must update the images on VM11:
1. Upload the source code to VM11 using the command `./sync.sh `;
2. This command should upload the source code to the `/profils/$USER/models` directory;

3. Connect via SSh to VM11 and go to the `~/models` directory
4. Use the following commands to build images:
``` SH 
./manage_dataimport.sh build
./miscellaneous/manage.sh build_dataread
./miscellaneous/manage.sh build_posttreatment
```

### Commands for local debugging of subprojects in containers

Since we have 3 subprojects that connect in a pipeline, there will be 3 sets of commands for independent debugging of each subproject

1. Dataimport subproject
``` SH
# To build the `ac-import/runtime` image
./manage_dataimport.sh build
# To start the container and establish a bash session with the container. Then you will be able to debug the application interactively.
./manage_dataimport.sh run
# To run the container in command mode. Application execution is controlled by environment variables. You must specify the necessary variables in the environment variable to control the application running in the container.
./manage_dataimport.sh execute
```
2. Dataread subproject
``` SH
./miscellaneous/manage.sh build_dataread
./miscellaneous/manage.sh execute_dataread
```
3. Posttreatment subproject
``` SH
./miscellaneous/manage.sh build_posttreatment
./miscellaneous/manage.sh execute_posttreatment
```
### start.sh scripts
All subproject directories contain one bash script file named `start.sh`. These files are the main executables that run in containers and are controlled by environment variables provided to the container. These scripts create all necessary files and directories and execute Python and R scripts.

-----------------------------------------------------------------------------------------

## Application for running tasks/containers on a virtual machine (task runner)

This is a web application that creates containers on a VM 11.

## How to clone the repository
```
git clone https://gitlab.acri-cwa.fr/nmaltsev/task-runner.git 
```
### How to deploy to the VM11
1. You must use the `./sync.sh` command to upload the source code and run the application.
