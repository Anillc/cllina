{
    description = "Anillc's bot";
    inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    inputs.flake-utils = {
        url = "github:numtide/flake-utils";
        inputs.nixpkgs.follows = "nixpkgs";
    };

    outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let
        pkgs = import nixpkgs { inherit system; };
    in{
        apps.build = flake-utils.lib.mkApp {
            name = "build";
            drv = pkgs.writeScriptBin "build" ''
                export PATH=$PATH:${with pkgs; lib.strings.makeBinPath [
                    yarn
                    cmake
                ]}
                yarn install
            ''; 
        };
        defaultApp = flake-utils.lib.mkApp {
            name = "run";
            drv = pkgs.writeScriptBin "run" ''
                export PATH=${with pkgs; lib.strings.makeBinPath [
                    yarn
                    chromium
                    gawk
                    findutils
                ]}
                export LD_LIBRARY_PATH=${with pkgs; lib.strings.makeLibraryPath [
                    libuuid
                ]}
                yarn start
            '';
        };
    });
}