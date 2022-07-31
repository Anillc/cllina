{
    description = "cllina";

    inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let 
        pkgs = import nixpkgs { inherit system; };
    in with builtins; with pkgs.lib; {
        packages.default = pkgs.mkYarnPackage {
            name = "cllina";
            src = ./.;
            nativeBuildInputs = with pkgs; [ makeWrapper ];
            fixupPhase = ''
                runHook fixupPhase
                wrapProgram $out/bin/cllina --prefix PATH : ${with pkgs; makeBinPath [
                    chromium inkscape graphviz source-han-sans
                ]}
            '';
        };
        devShell = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
                nodejs inkscape graphviz
            ];
        };
    });
}