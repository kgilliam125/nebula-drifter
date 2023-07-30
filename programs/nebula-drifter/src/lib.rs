use anchor_lang::prelude::*;

declare_id!("9M6Rorip8xtNHS19hJyH6ECfpKwPKAn8RQMW8uhHdYYV");

#[program]
pub mod nebula_drifter {
    use super::*;

    pub fn init_game_state_for_player(ctx: Context<InitGameStateForPlayer>) -> Result<()> {
        let game_state = &mut ctx.accounts.game_state;

        game_state.player = *ctx.accounts.signer.key;
        game_state.ore = 0;
        game_state.crystal = 0;
        game_state.platinum = 0;
        game_state.upgrade_level = 0;
        game_state.is_initialized = true;

        Ok(())
    }

    pub fn add_resources(
        ctx: Context<AddResources>,
        ore: u16,
        crystal: u16,
        platinum: u16,
    ) -> Result<()> {
        require!(ctx.accounts.game_state.player == *ctx.accounts.signer.key, GameError::WrongPlayer);

        let game_state = &mut ctx.accounts.game_state;

        game_state.ore += ore;
        game_state.crystal += crystal;
        game_state.platinum += platinum;

        Ok(())
    }

    pub fn upgrade(
        ctx: Context<Upgrade>,
        ore: u16,
        crystal: u16,
        platinum: u16,
    ) -> Result<()> {
        require!(ctx.accounts.game_state.player == *ctx.accounts.signer.key, GameError::WrongPlayer);

        let game_state = &mut ctx.accounts.game_state;

        // todo include actual upgrade costs here instead of client
        match game_state.upgrade_level {
            0 => {
                game_state.ore -= ore;
                game_state.crystal -= crystal;
                game_state.platinum -= platinum;
                game_state.upgrade_level = 1;
            }
            1 => {
                game_state.ore -= ore;
                game_state.crystal -= crystal;
                game_state.platinum -= platinum;
                game_state.upgrade_level = 2;
                
            }
            2 => {
                game_state.ore -= ore;
                game_state.crystal -= crystal;
                game_state.platinum -= platinum;
                game_state.upgrade_level = 3;
            }
            _ => {}
        }

        Ok(())
    }

    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        require!(ctx.accounts.game_state.player == *ctx.accounts.signer.key, GameError::WrongPlayer);

        let game_state = &mut ctx.accounts.game_state;

        game_state.ore = 0;
        game_state.crystal = 0;
        game_state.platinum = 0;
        game_state.upgrade_level = 0;

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
pub struct AddResources<'info> {
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
pub struct Upgrade<'info> {
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
    upgrade_level: u8,
    is_initialized: bool,
}

#[error_code]
enum GameError {
    #[msg("Player and signer do not match")]
    WrongPlayer,
}