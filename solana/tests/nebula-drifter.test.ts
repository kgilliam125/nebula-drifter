import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NebulaDrifter } from "../target/types/nebula_drifter";

describe("nebula-drifter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NebulaDrifter as Program<NebulaDrifter>;

  const [gameStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), provider.publicKey.toBuffer()],
    program.programId
  );

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initGameStateForPlayer()
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.player).toEqual(provider.publicKey);
    expect(gameState.ore).toEqual(0);
    expect(gameState.crystal).toEqual(0);
    expect(gameState.platinum).toEqual(0);
    expect(gameState.upgradeLevel).toEqual(0);
  });

  it("Can mine resources!", async () => {
    const tx = await program.methods
      .addResources(10, 10, 10)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(10);
    expect(gameState.crystal).toEqual(10);
    expect(gameState.platinum).toEqual(10);
  })

  it("Upgrades to 1!", async () => {
    const tx = await program.methods
      .upgrade(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(9);
    expect(gameState.crystal).toEqual(9);
    expect(gameState.platinum).toEqual(9);
    expect(gameState.upgradeLevel).toEqual(1);
  })

  it("Upgrades to 2!", async () => {
    const tx = await program.methods
      .upgrade(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(8);
    expect(gameState.crystal).toEqual(8);
    expect(gameState.platinum).toEqual(8);
    expect(gameState.upgradeLevel).toEqual(2);
  })

  it("Upgrades to 3!", async () => {
    const tx = await program.methods
      .upgrade(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(7);
    expect(gameState.crystal).toEqual(7);
    expect(gameState.platinum).toEqual(7);
    expect(gameState.upgradeLevel).toEqual(3);
  })

  it("Does not upgrade past 3 and does not consume resources", async () => {
    const tx = await program.methods
      .upgrade(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(7);
    expect(gameState.crystal).toEqual(7);
    expect(gameState.platinum).toEqual(7);
    expect(gameState.upgradeLevel).toEqual(3);
  })

  it("Resets game!", async () => {
    const tx = await program.methods
      .reset()
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(0);
    expect(gameState.crystal).toEqual(0);
    expect(gameState.platinum).toEqual(0);
    expect(gameState.upgradeLevel).toEqual(0);
  })
});
