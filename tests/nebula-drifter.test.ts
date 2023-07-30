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
    console.log("Your transaction signature", tx);
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
    console.log("Your transaction signature", tx);
  })

  it("Can mine resources!", async () => {
    const tx = await program.methods
      .upgrade(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(9);
    expect(gameState.crystal).toEqual(9);
    expect(gameState.platinum).toEqual(9);
    expect(gameState.upgradeLevel).toEqual(1);
    console.log("Your transaction signature", tx);
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
    console.log("Your transaction signature", tx);
  })

});
