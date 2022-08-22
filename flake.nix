{
    description = "cllina";

    inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let 
        pkgs = import nixpkgs { inherit system; };
    in with builtins; with pkgs.lib; let
        deps = pkgs.mkYarnModules {
            pname = "cllina-deps";
            version = "1.0.0";
            yarnLock = ./yarn.lock;
            packageJSON = ./package.json;
        };
    in {
        packages.default = pkgs.stdenv.mkDerivation {
            name = "cllina";
            src = ./.;
            nativeBuildInputs = with pkgs; [ makeWrapper ];
            buildPhase = ''
                ${pkgs.esbuild}/bin/esbuild --outdir=lib --format=cjs src/*.ts src/**/*.ts
            '';
            installPhase = ''
                mkdir -p $out/bin
                cp -r ${deps}/node_modules $out
                cp -r ./lib ./start.sh $out
                ln -s $out/start.sh $out/bin/cllina
            '';
            fixupPhase = ''
                runHook fixupPhase
                wrapProgram $out/bin/cllina --prefix PATH : ${with pkgs; makeBinPath [
                    which chromium inkscape graphviz
                ]}
            '';
        };
        devShell = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
                inkscape graphviz
            ];
        };
    });
}