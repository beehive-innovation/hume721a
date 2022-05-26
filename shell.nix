let
  pkgs = import
    (builtins.fetchTarball {
      name = "nixos-unstable-2021-10-01";
      url = "https://github.com/nixos/nixpkgs/archive/0c9407602d803a21452f4431e2da5c70d4128b6a.tar.gz";
      sha256 = "0fyw791bcvd6rd5g285fymwcbw1v5j0j8ykk2ramp6yi86gnkjp3";
    })
    { };

  prettier-check = pkgs.writeShellScriptBin "prettier-check" ''
    prettier --check .
  '';

  prettier-write = pkgs.writeShellScriptBin "prettier-write" ''
    prettier --write .
  '';

  ci-lint = pkgs.writeShellScriptBin "ci-lint" ''
    flush-all
    npm install
    solhint 'contracts/**/*.sol'
    prettier-check
    npm run lint
  '';

  security-check = pkgs.writeShellScriptBin "security-check" ''
    flush-all
    npm install

    # Run slither against all our contracts.
    # Disable npx as nix-shell already handles availability of what we need.
    # Dependencies and tests are out of scope.
    slither . --npx-disable --filter-paths="contracts/test" --exclude-dependencies
  '';

  ci-test = pkgs.writeShellScriptBin "ci-test" ''
    flush-all
    npm install
    hardhat compile --force
    hardhat test
  '';
in
pkgs.stdenv.mkDerivation {
  name = "shell";
  buildInputs = [
    pkgs.nixpkgs-fmt
    pkgs.nodejs-18_x
    pkgs.slither-analyzer
    prettier-check
    prettier-write
    security-check
    ci-test
    ci-lint
  ];

  shellHook = ''
    export PATH=$( npm bin ):$PATH
    # keep it fresh
    npm install
  '';
}
