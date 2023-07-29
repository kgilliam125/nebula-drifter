import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SpeedrunGameJam } from "../target/types/speedrun_game_jam";

describe("speedrun-game-jam", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SpeedrunGameJam as Program<SpeedrunGameJam>;

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
    console.log("Your transaction signature", tx);
  });

  it("Can mine resources!", async () => {
    const tx = await program.methods
      .updateGameState(1, 1, 1)
      .accounts({ gameState: gameStatePda })
      .rpc();

    const gameState = await program.account.gameState.fetch(gameStatePda);

    expect(gameState.ore).toEqual(1);
    expect(gameState.crystal).toEqual(1);
    expect(gameState.platinum).toEqual(1);
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
    console.log("Your transaction signature", tx);
  })

});
