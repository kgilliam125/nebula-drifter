use anchor_lang::prelude::*;

declare_id!("HGPJjX9fXH5dwJ8MkJTfmKbzUF7nLECjrB3ovts4DuBb");

#[program]
pub mod speedrun_game_jam {
    use super::*;

    pub fn init_game_state_for_player(ctx: Context<InitGameStateForPlayer>) -> Result<()> {
        // todo check to see if initialized

        let game_state = &mut ctx.accounts.game_state;

        game_state.player = *ctx.accounts.signer.key;
        game_state.ore = 0;
        game_state.crystal = 0;
        game_state.platinum = 0;
        game_state.is_initialized = true;

        Ok(())
    }

    pub fn update_game_state(
        ctx: Context<UpdateGameState>,
        ore: u16,
        crystal: u16,
        platinum: u16,
    ) -> Result<()> {
        // require!(ctx.accounts.game_state.is_initialized == true, Error::);

        let game_state = &mut ctx.accounts.game_state;

        game_state.ore += ore;
        game_state.crystal += crystal;
        game_state.platinum += platinum;

        Ok(())
    }

    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        // require!(ctx.accounts.game_state.is_initialized == true, Error::);

        let game_state = &mut ctx.accounts.game_state;

        game_state.ore = 0;
        game_state.crystal = 0;
        game_state.platinum = 0;

        Ok(())
    }
}

// game signs this when started a new ranking season
#[derive(Accounts)]
pub struct InitGameStateForPlayer<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer=signer,
        seeds=["state".as_bytes(), signer.key().as_ref()],
        bump,
        // Just make it large enough for expansion
        space = 1000,
    )]
    pub game_state: Account<'info, GameState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
// #[instruction(ore: u16, crystal: u16, platinum: u16)]
pub struct UpdateGameState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut, 
        seeds=["state".as_bytes(), signer.key().as_ref()],
        bump,
    )]
    pub game_state: Account<'info, GameState>,
}

#[derive(Accounts)]
// #[instruction(ore: u16, crystal: u16, platinum: u16)]
pub struct Reset<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds=["state".as_bytes(), signer.key().as_ref()],
        bump,
    )]
    pub game_state: Account<'info, GameState>,
}

#[account]
pub struct GameState {
    player: Pubkey, // the public key for this player
    ore: u16,       // actual_score = score / 100
    crystal: u16,
    platinum: u16,
    is_initialized: bool,
}
