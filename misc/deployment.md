
```
git clone <...>
git submodule update --init --recursive
```

## Submodules

You must run two commands: `git submodule init` to initialize your local configuration file, and `git submodule update` to fetch all the data from that project and check out the appropriate commit listed in the superproject.


git clone --recurse-submodules https://github.com/ARGANS/shellfish_and_algae-MODEL.git
git diff --submodule

### pull all changes in the repo including changes in the submodules
git pull --recurse-submodules

### pull all changes for the submodules
git submodule update --remote

### add submodule and define the master branch as the one you want to track
git submodule add -b master [URL to Git repo] 
git submodule init 
