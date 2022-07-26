{
    description = "cllina";

    inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }: flake-utils.lib.eachDefaultSystem (system: let 
        pkgs = import nixpkgs { inherit system; };
    in {
        devShell = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
                inkscape
            ];
        };
    });
}