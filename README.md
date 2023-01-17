# SpiderMod+

SpiderMod+ is a mod for _[The Binding of Isaac: Repentance](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/)_, written in [TypeScript](https://www.typescriptlang.org/) using the [IsaacScript](https://isaacscript.github.io/) framework.

## How To Play

Subscribe to it on the workshop [Here](https://steamcommunity.com/sharedfiles/filedetails/?id=2918355263)

## Developers

### How to Remove Health/Damage from my custom entity

There are two primary ways to do this:

1. Make your entity a variant of GENERIC_PROP(960)
2. Give your entity the flag of HIDE_HP_BAR (1 << 35)

Either of the above should remove both the health and damage numbers from your entity.
You won't have to do the above if your entity is a variant of an already blocked entity such as Stoney.

### How To Compile

- Download and install [Node.js](https://nodejs.org/en/download/) (Windows Installer .msi, 64-bit).
- Download and install [Git](https://git-scm.com/download/win) (64-bit Git for Windows setup).
- Download (or clone) this repository:
  - Click on the "Code" button in the top-right-corner of this page.
  - Click on "Download ZIP".
- Unzip the zip file to a new directory.
- Open up the repository folder and double-click on the `run.sh` script. If prompted, choose to open it with Git for Windows. You will see a Git Bash terminal window open.
- The script might ask you some questions, like which save file that you use for testing.
- If the script is successful, you will see "Compilation successful". (You can continue to leave the terminal window open; it will monitor for changes in your project, and recompile if necessary.)
- Completely close Isaac if it is already open, and then open the game again, and the mod should be in the list of mods. You can now play or test the mod.
